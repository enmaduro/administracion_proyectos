import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="mt-12 py-10 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="container mx-auto px-4 flex flex-col items-center text-center">
                <div className="flex flex-col items-center mb-6">
                    <img src="/logo-comuna.png" alt="Logo Comuna" className="h-24 w-24 object-contain mb-3" />
                    <div>
                        <p className="text-gray-800 dark:text-gray-200 font-bold text-lg">
                            Comuna Productiva Presidente Obrero
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                            Hecho por: Enrique Maduro. Con IA.
                        </p>
                    </div>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400 mb-6 bg-white/50 dark:bg-gray-900/10 px-6 py-2 rounded-full border border-gray-200 dark:border-gray-700">
                    <span className="block sm:inline">¿Dudas o recomendaciones? escribenos al: </span>
                    <a
                        href="mailto:adm.proy.2025@gmail.com"
                        className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-bold ml-1"
                    >
                        adm.proy.2025@gmail.com
                    </a>
                </div>

                <p className="text-xs text-gray-400 dark:text-gray-600">
                    © {new Date().getFullYear()} - Todos los derechos reservados
                </p>
            </div>
        </footer>
    );
};

export default Footer;
