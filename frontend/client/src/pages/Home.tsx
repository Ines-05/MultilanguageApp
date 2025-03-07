import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {Globe} from '../components/globe/globe'
import { motion } from "framer-motion";
import { MessageCircle, Users, Globe as GlobeIcon, Zap, Shield, Heart } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "Chat en Temps Réel",
    description: "Communiquez instantanément avec des personnes du monde entier sans barrière de langue."
  },
  {
    icon: Users,
    title: "Conversations de Groupe",
    description: "Créez des groupes multilingues et gardez tout le monde sur la même longueur d'onde."
  },
  {
    icon: GlobeIcon,
    title: "Support Multilingue",
    description: "Prise en charge de plusieurs langues avec traduction automatique en temps réel."
  },
  {
    icon: Zap,
    title: "Rapide et Efficace",
    description: "Interface réactive et traductions instantanées pour une communication fluide."
  },
  {
    icon: Shield,
    title: "Sécurisé",
    description: "Vos conversations sont privées et protégées. Nous prenons la sécurité au sérieux."
  },
  {
    icon: Heart,
    title: "Facile à Utiliser",
    description: "Interface intuitive conçue pour une expérience utilisateur optimale."
  }
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <section className="py-20 justify-between h-screen flex flex-col">
        <div className="flex h-full items-center gap-10">
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative h-full w-1/2"
          >
            <Globe className={"top-0 left-0"} />
          </motion.div>
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center w-1/2"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Chat Multilingue Intelligent
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Brisez les barrières linguistiques avec une traduction en temps réel.
              Connectez-vous avec n'importe qui, n'importe où, dans leur langue maternelle.
            </p>
          </motion.div>
        </div>

          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
          >
            <Link href="/chat">
              <Button size="lg" className="text-lg font-medium px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 transform hover:scale-105">
                Essayez Maintenant
              </Button>
            </Link>
          </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className=" px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Fonctionnalités Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-lg bg-card border"
                >
                  <Icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t mt-auto">
        <div className=" px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                MultiLingual Chat
              </h3>
              <p className="text-sm text-muted-foreground">
                Connectez-vous avec le monde entier, sans barrière de langue.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features">Fonctionnalités</Link></li>
                <li><Link href="/pricing">Tarifs</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/docs">Documentation</Link></li>
                <li><Link href="/support">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy">Confidentialité</Link></li>
                <li><Link href="/terms">Conditions</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} MultiLingual Chat. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}