import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

export default function HistoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Conversation History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Chat history coming soon! This is a placeholder.
        </p>
      </CardContent>
    </Card>
  );
}
