import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center max-w-lg p-8 bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-5xl font-bold text-blue-600">404</h1>
        <p className="mb-4 text-2xl font-semibold text-gray-800">Página Não Encontrada</p>
        <p className="mb-6 text-lg text-gray-600">
          O erro 404 ocorre quando o servidor não consegue localizar o recurso solicitado. Isso pode acontecer por vários motivos, como:
        </p>
        <ul className="mb-6 text-left text-gray-600 list-disc pl-6">
          <li>Um URL digitado incorretamente.</li>
          <li>Uma página que foi movida ou removida.</li>
          <li>Um link quebrado de outra fonte.</li>
        </ul>
        <p className="mb-6 text-lg text-gray-600">
          Na gestão atípica, assim como na navegação web, é importante aprender com os erros e adaptar-se. Use isso como oportunidade para explorar o site corretamente!
        </p>
        <a href="/" className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-300">
          Voltar para a Página Inicial
        </a>
      </div>
    </div>
  );
};

export default NotFound;