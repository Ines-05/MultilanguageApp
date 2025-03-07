import asyncio
from concurrent.futures import ThreadPoolExecutor
from transformers import MBartForConditionalGeneration, MBart50Tokenizer
from redis import asyncio as aioredis
from sqlalchemy.orm import Session
from app.models.user import User

LANG_CODE_MAP = {
    "fr": "fr_XX",
    "en": "en_XX",
    "es": "es_XX",
    "de": "de_DE",
}

model_name = "facebook/mbart-large-50-many-to-many-mmt"
tokenizer = MBart50Tokenizer.from_pretrained(model_name)
model = MBartForConditionalGeneration.from_pretrained(model_name)
redis = aioredis.from_url("redis://localhost:6379", encoding="utf-8", decode_responses=True)
executor = ThreadPoolExecutor(max_workers=4)


def generate_cache_key(text: str, source_lang: str, target_lang: str, register: str) -> str:
    return f"translation:{source_lang}:{target_lang}:{register}:{hash(text)}"


def translate_sync(text: str, source_lang: str, target_lang: str, register: str) -> str:
    src_code = LANG_CODE_MAP.get(source_lang, source_lang)
    tgt_code = LANG_CODE_MAP.get(target_lang, target_lang)

    tokenizer.src_lang = src_code
    encoded = tokenizer(text, return_tensors="pt")

    generated_tokens = model.generate(
        **encoded,
        forced_bos_token_id=tokenizer.lang_code_to_id[tgt_code],
        max_length=512  # Augmentation de la longueur maximale
    )
    return tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]


async def get_user_translation_params(target_user_id: str, db: Session):
    """
    Récupère les paramètres de traduction pour l'utilisateur cible depuis la base de données.
    Retourne un tuple (default_language, language_level).
    Si l'utilisateur n'est pas trouvé, retourne (None, "courant").
    """
    user = db.query(User).filter(User.id == target_user_id).first()
    if not user:
        return None, "courant"
    return user.default_language, user.language_level


async def translate_for_user(
    text: str,
    source_lang: str,
    to_langs_or_target_user: str | list,
    register: str,
    db: Session = None,
) -> dict:
    """
    Traduction adaptable :
      - Si to_langs_or_target_user est une liste, on considère que ce sont directement les codes de langues cibles.
      - Sinon, on considère qu'il s'agit d'un identifiant d'utilisateur et on récupère la langue cible via la BDD (en utilisant la session db).
    Le retour est un dictionnaire {code_langue: traduction}.
    """
    if isinstance(to_langs_or_target_user, list):
        target_langs = to_langs_or_target_user
        used_register = register
    else:
        if db is None:
            raise ValueError("Une session DB est requise lorsque l'on fournit un identifiant d'utilisateur.")
        target_lang, used_register = await get_user_translation_params(to_langs_or_target_user, db)
        if not target_lang:
            # Si aucun paramètre n'est défini pour l'utilisateur, retourne le texte original
            return {source_lang: text}
        target_langs = [target_lang]

    translations = {}
    for tgt in target_langs:
        cache_key = generate_cache_key(text, source_lang, tgt, used_register)
        cached = await redis.get(cache_key)
        if cached:
            translations[tgt] = cached
        else:
            loop = asyncio.get_event_loop()
            translation = await loop.run_in_executor(
                executor, translate_sync, text, source_lang, tgt, used_register
            )
            await redis.set(cache_key, translation, ex=3600)
            translations[tgt] = translation
    return translations
