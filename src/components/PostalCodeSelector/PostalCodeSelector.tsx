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
          setDistricts(data.map((d: { distrito: string }) => d.distrito)); // Extrai os nomes dos distritos
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
  const handlePostalCodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const postalCode = e.target.value;
    setUser({ ...user, postalCode });

    // Validação básica para códigos postais de 4 dígitos
    if (postalCode.length === 4) {
      try {
        const response = await fetch(`https://json.geoapi.pt/cp/${postalCode}`);
        if (response.ok) {
          const data = await response.json();
          if (data.distrito) {
            setUser((prevUser) => ({ ...prevUser, state: data.distrito })); // Atualiza o estado com o distrito retornado
            setPostalCodeError("");
          } else {
            setPostalCodeError(
              "Distrito não encontrado para o código postal informado."
            );
            setUser((prevUser) => ({ ...prevUser, state: "" }));
          }
        } else {
          setPostalCodeError("Código postal inválido ou não encontrado.");
          setUser((prevUser) => ({ ...prevUser, state: "" }));
        }
      } catch (err) {
        console.error("Erro ao buscar o distrito:", err);
        setPostalCodeError("Erro ao buscar o distrito. Tente novamente.");
        setUser((prevUser) => ({ ...prevUser, state: "" }));
      }
    } else {
      setPostalCodeError("O código postal deve ter 4 dígitos.");
      setUser((prevUser) => ({ ...prevUser, state: "" }));
    }
  };

  // Atualiza o estado ao selecionar um distrito manualmente
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value;
    setUser({ ...user, state });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
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
