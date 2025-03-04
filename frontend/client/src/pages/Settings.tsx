import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Languages } from "lucide-react";
import { useState } from "react";
import { supportedLanguages, languageLevels } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    newMessage: true,
    translationReady: true,
    soundEnabled: false,
  });
  const [language, setLanguage] = useState("fr");
  const [languageLevel, setLanguageLevel] = useState("standard");

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences ont été mises à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde des paramètres",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Paramètres de Langue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Langue de l'interface</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map(({ code, name }) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Niveau de langue par défaut</Label>
            <Select value={languageLevel} onValueChange={setLanguageLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageLevels.map(({ code, name }) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="newMessage" className="flex-1">
              Nouveaux messages
              <p className="text-sm text-muted-foreground">
                Recevoir une notification pour les nouveaux messages
              </p>
            </Label>
            <Switch
              id="newMessage"
              checked={notifications.newMessage}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, newMessage: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="translationReady" className="flex-1">
              Traductions terminées
              <p className="text-sm text-muted-foreground">
                Notification lorsqu'une traduction est prête
              </p>
            </Label>
            <Switch
              id="translationReady"
              checked={notifications.translationReady}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, translationReady: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="soundEnabled" className="flex-1">
              Sons de notification
              <p className="text-sm text-muted-foreground">
                Activer les sons pour les notifications
              </p>
            </Label>
            <Switch
              id="soundEnabled"
              checked={notifications.soundEnabled}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, soundEnabled: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">
        Sauvegarder les paramètres
      </Button>
    </div>
  );
}