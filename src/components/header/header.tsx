"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Ticket, Menu, X, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para verificar se o usuário está logado
  const [isAuthChecked, setIsAuthChecked] = useState(false); // Estado para verificar se a autenticação foi checada
  const pathname = usePathname();
  const router = useRouter();

  // Lista de páginas protegidas
  const protectedPages = ["/create-voucher", "/dashboard", "/support", "/account"];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => pathname === path;

  // Função para lidar com o logout
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (response.ok) {
        setIsLoggedIn(false); // Atualiza o estado para deslogado
        router.push("/login"); // Redireciona para login após logout
      } else {
        console.error("Erro ao fazer logout");
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Verifica se o usuário está autenticado ao carregar o componente
useEffect(() => {
  const checkAuth = async () => {
    try {
      const response = await fetch("/api/login", { method: "GET" });
      if (response.ok) {
        setIsLoggedIn(true); // Usuário autenticado
      } else if (response.status === 401) {
        // Trata o caso de usuário não autenticado sem exibir erro no console
        setIsLoggedIn(false);
      } else {
        console.error("Erro inesperado ao verificar autenticação:", response.status);
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      setIsLoggedIn(false);
    } finally {
      setIsAuthChecked(true); // Finaliza a verificação de autenticação
    }
  };

  checkAuth();
}, []);

  // Redireciona para login se o usuário tentar acessar uma página protegida sem estar autenticado
  useEffect(() => {
    if (isAuthChecked && !isLoggedIn && protectedPages.includes(pathname)) {
      router.push("/login");
    }
  }, [isAuthChecked, isLoggedIn, pathname, router]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Ticket className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl text-gray-800">Voucher Portal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/create-voucher"
              className={`${
                isActive("/create-voucher") ? "text-blue-600 font-semibold" : "text-gray-600"
              } hover:text-blue-600 font-medium transition-colors`}
            >
              Vouchers
            </Link>
            <Link
              href="/dashboard"
              className={`${
                isActive("/dashboard") ? "text-blue-600 font-semibold" : "text-gray-600"
              } hover:text-blue-600 font-medium transition-colors`}
            >
              Dashboard
            </Link>
            <Link
              href="/"
              className={`${
                isActive("/") ? "text-blue-600 font-semibold" : "text-gray-600"
              } hover:text-blue-600 font-medium transition-colors`}
            >
              Plans
            </Link>
            <Link
              href="/support"
              className={`${
                isActive("/support") ? "text-blue-600 font-semibold" : "text-gray-600"
              } hover:text-blue-600 font-medium transition-colors`}
            >
              Support
            </Link>
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-600">
              <Search className="h-5 w-5" />
            </Button>
            {isAuthChecked ? (
              isLoggedIn ? (
                <>
                  <Link href="/account">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Conta
                    </Button>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Sign up
                    </Button>
                  </Link>
                </>
              )
            ) : (
              <>
                {/* Exibe botões de login e signup enquanto verifica autenticação */}
                <Link href="/login">
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-2 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/create-voucher"
                className={`px-4 py-2 rounded-md ${
                  isActive("/create-voucher") ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                }`}
                onClick={toggleMenu}
              >
                Vouchers
              </Link>
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-md ${
                  isActive("/dashboard") ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                }`}
                onClick={toggleMenu}
              >
                Dashboard
              </Link>
              <Link
                href="/"
                className={`px-4 py-2 rounded-md ${
                  isActive("/") ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                }`}
                onClick={toggleMenu}
              >
                Plans
              </Link>
              <Link
                href="/support"
                className={`px-4 py-2 rounded-md ${
                  isActive("/support") ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                }`}
                onClick={toggleMenu}
              >
                Support
              </Link>
              <div className="pt-2 border-t border-gray-200">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md"
                      onClick={toggleMenu}
                    >
                      Account
                    </Link>
                    <Button
                      onClick={() => {
                        handleLogout();
                        toggleMenu();
                      }}
                      className="w-full mt-2 border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md"
                      onClick={toggleMenu}
                    >
                      Log in
                    </Link>
                    <Link href="/signup" onClick={toggleMenu}>
                      <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                        Sign up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}