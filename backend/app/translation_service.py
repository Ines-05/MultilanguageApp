import asyncio
from concurrent.futures import ThreadPoolExecutor
from transformers import MBartForConditionalGeneration, MBart50Tokenizer
from redis import asyncio as aioredis


# Mapping des codes de langue (les codes simplifiés envoyés par le frontend vers les codes mBART)
LANG_CODE_MAP = {
    "fr": "fr_XX",
    "en": "en_XX",
    "es": "es_XX",
    "de": "de_DE",
    # Ajoutez d'autres langues si besoin
}

# Chargement du modèle mBART et du tokenizer
model_name = "facebook/mbart-large-50-many-to-many-mmt"
tokenizer = MBart50Tokenizer.from_pretrained(model_name)
model = MBartForConditionalGeneration.from_pretrained(model_name)

# Initialisation asynchrone de Redis
redis = aioredis.from_url("redis://localhost:6379", encoding="utf-8", decode_responses=True)

# Executor pour exécuter les appels synchrones de façon non bloquante
executor = ThreadPoolExecutor(max_workers=4)


def generate_cache_key(text: str, source_lang: str, target_lang: str, register: str) -> str:
    """Génère une clé de cache pour Redis."""
    return f"translation:{source_lang}:{target_lang}:{register}:{hash(text)}"


def translate_sync(text: str, source_lang: str, target_lang: str, register: str) -> str:
    """
    Fonction synchrone de traduction avec mBART.
    La conversion des codes de langue se fait via LANG_CODE_MAP.
    Le paramètre 'register' est présent pour une éventuelle adaptation du registre.
    """
    src_code = LANG_CODE_MAP.get(source_lang, source_lang)
    tgt_code = LANG_CODE_MAP.get(target_lang, target_lang)

    # Configurer le tokenizer pour la langue source
    tokenizer.src_lang = src_code
    encoded = tokenizer(text, return_tensors="pt")

    # Traduction avec génération forcée du token début pour la langue cible
    generated_tokens = model.generate(
        **encoded, forced_bos_token_id=tokenizer.lang_code_to_id[tgt_code]
    )
    translated_text = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]

    # Vous pouvez ajouter ici un post-traitement pour adapter le registre si nécessaire
    return translated_text


async def translate_text(
    text: str, source_lang: str, target_langs: list[str], register: str = "courant"
) -> dict[str, str]:
    """
    Fonction asynchrone de traduction qui :
      1. Vérifie le cache Redis,
      2. Exécute la traduction dans un thread séparé si besoin,
      3. Stocke le résultat dans le cache.
    Retourne un dictionnaire avec les traductions pour chaque langue cible.
    """
    translations = {}
    for target_lang in target_langs:
        cache_key = generate_cache_key(text, source_lang, target_lang, register)
        cached = await redis.get(cache_key)
        if cached:
            translations[target_lang] = cached
            continue

        loop = asyncio.get_event_loop()
        translation = await loop.run_in_executor(
            executor, translate_sync, text, source_lang, target_lang, register
        )
        await redis.set(cache_key, translation, ex=3600)  # Cache pendant 1 heure
        translations[target_lang] = translation

    return translations
