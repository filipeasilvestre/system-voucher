"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, User, Save } from "lucide-react";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";

export default function AccountPage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    company: "",
    contact: "",
    address: "",
    postalCode: "",
    state: "",
    fatNumber: "",
    companyLogo: "",
  });
  const [districts, setDistricts] = useState<string[]>([]); // Lista de distritos
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [postalCodeError, setPostalCodeError] = useState("");

  // Busca os detalhes do usuário logado
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch("/api/account", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else if (response.status === 401) {
          // Redireciona para login se o usuário não estiver autenticado
          window.location.href = "/login";
        } else {
          setError("Erro ao carregar os detalhes do usuário.");
        }
      } catch (err) {
        setError("Erro ao carregar os detalhes do usuário.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  // Busca todos os distritos ao carregar a página
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await fetch("https://json.geoapi.pt/distritos");
        if (response.ok) {
          const data = await response.json();
          console.log("Distritos carregados:", data); // Log para verificar os distritos
          setDistricts(data.map((d: { distrito: string }) => d.distrito));
        } else {
          console.error(
            "Erro ao carregar os distritos. Status:",
            response.status
          );
          setError("Erro ao carregar os distritos.");
        }
      } catch (err) {
        console.error("Erro ao carregar os distritos:", err);
        setError("Erro ao carregar os distritos.");
      }
    };

    fetchDistricts();
  }, []);

  // Salva as alterações do usuário
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/account", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        setSuccess("Detalhes atualizados com sucesso!");
      } else {
        setError("Erro ao salvar os detalhes do usuário.");
      }
    } catch (err) {
      setError("Erro ao salvar os detalhes do usuário.");
    } finally {
      setIsSaving(false);
    }
  };

  // Atualiza o estado ao alterar o código postal
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const postalCode = e.target.value;
    setUser({ ...user, postalCode });
  };

  // Atualiza o estado ao selecionar um distrito
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value;
    setUser({ ...user, state });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-800 py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-center mb-4">
              <User className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-white font-bold text-3xl text-center">
              Minha Conta
            </h1>
            <p className="text-white text-center mt-2">
              Gerencie suas informações pessoais
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Card className="border-gray-200 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Informações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    {success}
                  </div>
                )}
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome
                      </label>
                      <input
                        type="text"
                        value={user.name}
                        onChange={(e) =>
                          setUser({ ...user, name: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 cursor-not-allowed"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Empresa
                      </label>
                      <input
                        type="text"
                        value={user.company}
                        onChange={(e) =>
                          setUser({ ...user, company: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contato
                      </label>
                      <input
                        type="text"
                        value={user.contact}
                        onChange={(e) =>
                          setUser({ ...user, contact: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endereço
                      </label>
                      <input
                        type="text"
                        value={user.address}
                        onChange={(e) =>
                          setUser({ ...user, address: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        value={user.postalCode}
                        onChange={handlePostalCodeChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {postalCodeError && (
                        <p className="text-red-500 text-sm mt-1">
                          {postalCodeError}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <select
                        value={user.state}
                        onChange={handleStateChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecione um distrito</option>
                        {districts.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NIF
                      </label>
                      <input
                        type="text"
                        value={user.fatNumber}
                        onChange={(e) =>
                          setUser({ ...user, fatNumber: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logo da Empresa
                      </label>
                      <input
                        type="text"
                        value={user.companyLogo}
                        onChange={(e) =>
                          setUser({ ...user, companyLogo: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
