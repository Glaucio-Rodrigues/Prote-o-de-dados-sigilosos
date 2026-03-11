import React, { useState } from 'react';

interface RegisterStepProps {
  onBack: () => void;
  onSuccess: (userData: any) => void;
}

export default function RegisterStep({ onBack, onSuccess }: RegisterStepProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    securityCode: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.securityCode.length !== 6) {
      setError('O código de segurança deve ter exatamente 6 dígitos.');
      return;
    }
    
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        onSuccess(data);
      } else {
        setError(data.error || 'Erro ao criar conta');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    }
  };

  return (
    <>
      <div className="flex flex-col pt-4">
        <h1 className="text-3xl md:text-4xl font-medium text-gray-900 leading-tight mb-8">
          Crie sua conta no<br />Portal Sigiloso
        </h1>
        <p className="text-gray-600 mb-16">
          Preencha seus dados para ter acesso aos documentos do escritório.
        </p>

        <div className="mt-auto md:mt-16 space-y-6">
          <button onClick={onBack} className="text-blue-600 text-sm font-medium hover:underline inline-block">
            Voltar para o login
          </button>
        </div>
      </div>

      <div className="flex justify-center md:justify-end">
        <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-8 w-full max-w-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
            
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Nome Completo</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-600 mb-1 block">CPF</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Celular (com DDD)</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 81999389985"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Senha</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Código de segurança (6 dígitos)</label>
              <input
                type="text"
                maxLength={6}
                value={formData.securityCode}
                onChange={(e) => setFormData({...formData, securityCode: e.target.value.replace(/\D/g, '')})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-[0.5em]"
                placeholder="000000"
                required
              />
            </div>
            
            <button
              type="submit"
              className="bg-[#3b82f6] hover:bg-blue-600 text-white font-medium rounded-lg py-3 mt-4 transition-colors"
            >
              Cadastrar
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
