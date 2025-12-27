import React, { useState } from 'react';

interface ApiKeyModalProps {
    currentApiKey?: string;
    onSave: (key: string) => void;
    onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ currentApiKey, onSave, onClose }) => {
    const [key, setKey] = useState(currentApiKey || '');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Configurar API Key</h2>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    El error <strong>429 (Quota Exceeded)</strong> significa que la clave compartida ha superado el límite gratuito.
                    <br /><br />
                    Para solucionar esto permanentemente, ingresa tu propia clave de Google Gemini (es gratis).
                </p>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tu Clave de API
                    </label>
                    <input
                        type="password"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="AIza..."
                    />
                    <div className="mt-2 text-xs text-right">
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Obtener clave aquí &rarr;
                        </a>
                    </div>
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave(key)}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
