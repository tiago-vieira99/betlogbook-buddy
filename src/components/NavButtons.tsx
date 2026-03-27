import { useNavigate, useLocation } from "react-router-dom";
import { Users, TrendingUp, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NavButtons() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Button
        variant={pathname === "/teams" ? "default" : "outline"}
        size="sm"
        className="gap-2"
        onClick={() => navigate("/teams")}
      >
        <Users className="w-4 h-4" />
        Teams
      </Button>
      <Button
        variant={pathname === "/streaks" ? "default" : "outline"}
        size="sm"
        className="gap-2"
        onClick={() => navigate("/streaks")}
      >
        <TrendingUp className="w-4 h-4" />
        Streaks
      </Button>
      <Button
        variant={pathname === "/insights" ? "default" : "outline"}
        size="sm"
        className="gap-2"
        onClick={() => navigate("/insights")}
      >
        <Lightbulb className="w-4 h-4" />
        Insights
      </Button>
    </div>
  );
}
