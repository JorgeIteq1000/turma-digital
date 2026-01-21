import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, AppNotification } from "@/hooks/use-notifications";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const navigate = useNavigate();

  const handleClick = (notification: AppNotification) => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-4">
          <h4 className="font-semibold">Notificações</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 text-xs text-muted-foreground"
              onClick={() => markAllAsRead.mutate()}
            >
              <Check className="mr-1 h-3 w-3" />
              Marcar lidas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 opacity-20" />
              <p className="text-sm">Nenhuma notificação.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleClick(item)}
                  className={cn(
                    "flex flex-col items-start gap-1 border-b p-4 text-left text-sm transition-colors hover:bg-muted/50",
                    !item.read && "bg-primary/5 hover:bg-primary/10",
                    item.type === "live" &&
                      "border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-900/10",
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span
                      className={cn(
                        "font-medium",
                        item.type === "live" && "text-red-600",
                      )}
                    >
                      {item.title}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.type === "live"
                        ? "Agora"
                        : formatDistanceToNow(new Date(item.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">
                    {item.message}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
