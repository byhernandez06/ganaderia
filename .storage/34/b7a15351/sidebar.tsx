import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Beef, 
  Activity, 
  BarChart, 
  Settings, 
  Menu, 
  X,
  MilkOff,
  Tractor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFarmContext } from "@/contexts/FarmContext";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { farm } = useFarmContext();
  const location = useLocation();
  
  const links = [
    { name: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, path: "/" },
    { name: "Animales", icon: <Beef className="h-5 w-5" />, path: "/animals" },
    { name: "Registros de Salud", icon: <Activity className="h-5 w-5" />, path: "/health-records" },
    { name: "Producción", icon: <MilkOff className="h-5 w-5" />, path: "/production" },
    { name: "Reportes", icon: <BarChart className="h-5 w-5" />, path: "/reports" },
    { name: "Configuración", icon: <Settings className="h-5 w-5" />, path: "/settings" },
  ];

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <Farm className="h-6 w-6" />
            <span className="text-lg font-medium">{farm.name}</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="flex w-full items-center justify-center">
            <Farm className="h-6 w-6" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("ml-auto", collapsed && "mx-auto")}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                location.pathname === link.path
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              {link.icon}
              {!collapsed && <span className="ml-3">{link.name}</span>}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <div className="flex flex-col gap-1">
          {!collapsed && (
            <>
              <p className="text-xs font-medium leading-none text-muted-foreground">
                {farm.location}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {farm.size} {farm.units}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}