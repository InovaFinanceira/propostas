'use client';

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserRound } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import { useCurrentUser } from "@/hooks/use-current-user";

export function Header() {
  const { currentUser, logout } = useCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 sm:px-6 shadow-sm">
      <Link href="/propostas">
          <Image
            src="/logo.png"
            alt="Grupo Inova Financeira Logo"
            width={65}
            height={22}
          />
      </Link>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-700">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
                </span>
              </div>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-semibold">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser?.name || 'Usuário'}</p>
                <p className="text-xs leading-none text-muted-foreground">{currentUser?.email || ''}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAdmin && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/usuarios">Usuários</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild>
              <Link href="/">Sair</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
