import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="mt-12 py-6 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="container mx-auto px-4 text-center">
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Hecho por: Enrique Maduro. Con IA.
                </p>
                <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">
                    Comuna Productiva Presidente Obrero
                </p>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                    <p>Cualquier duda o recomendación al correo:</p>
                    <a
                        href="mailto:adm.proy.2025@gmail.com"
                        className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                        adm.proy.2025@gmail.com
                    </a>
                </div>
                <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">
                    © {new Date().getFullYear()} - Todos los derechos reservados
                </p>
            </div>
        </footer>
    );
};

export default Footer;
