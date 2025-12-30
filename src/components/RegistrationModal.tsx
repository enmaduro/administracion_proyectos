import React, { useState } from 'react';

interface RegistrationModalProps {
  onComplete: () => void;
  registrationLink: string; 
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ onComplete, registrationLink }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState({ community: '', person: '', state: '' });

  const handleOpenForm = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // IMPORTANTE: Evita que el clic cierre la ventana
    
    try {
      window.open(registrationLink, '_blank');
      // Marcamos como registrado visualmente, pero la real confirmación es el botón "Continuar"
      setIsRegistered(true);
    } catch (error) {
      console.error("Error al abrir navegador:", error);
      alert("Hubo un error al abrir el navegador. Por favor, inténtelo manualmente.");
    }
  };

  const handleConfirm = () => {
    if (!isRegistered) {
      alert("Por favor, primero abre el formulario de registro y rellénalo.");
      return;
    }
    localStorage.setItem('gastos_app_registered', 'true');
    onComplete();
  };
  
  // Manejo seguro de cambios en inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevenir burbujeo
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    // Usamos <form> para evitar recargas accidentales al presionar Enter
    <form 
      onSubmit={(e) => {
        e.preventDefault(); 
        e.stopPropagation(); 
      }}
      className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
    >
      {/* El contenedor blanco debe tener pointer-events-auto */}
      <div className="pointer-events-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center border-t-4 border-primary-500">
        
        {/* Icono de Registro */}
        <div className="mx-auto bg-primary-100 dark:bg-primary-900/30 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-wide">
          Registro de Uso
        </h2>
        
        <p className="text-slate-600 dark:text-slate-300 text-base mb-6">
          Antes de continuar utilizando el <strong>Gestor de Gastos</strong>, es necesario registrar tu comunidad una sola vez.
        </p>

        <div className="bg-slate-50 dark:bg-gray-700/50 rounded-lg p-6 mb-8 text-left border border-slate-200 dark:border-slate-600">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Datos Visuales (Opcional)</label>
          
          <input 
            type="text" 
            name="community"
            placeholder="Nombre de la Comunidad"
            className="w-full mb-3 p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-gray-800 text-sm"
            value={formData.community}
            onChange={handleInputChange}
          />
          
          <input 
            type="text" 
            name="person"
            placeholder="Responsable"
            className="w-full mb-3 p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-gray-800 text-sm"
            value={formData.person}
            onChange={handleInputChange}
          />
          
           <input 
            type="text" 
            name="state"
            placeholder="Estado / Región"
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-gray-800 text-sm"
            value={formData.state}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button" // type button para evitar que subm el form
            onClick={handleOpenForm}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-3 text-lg ${
              isRegistered ? 'bg-green-600 hover:bg-green-700' : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {isRegistered ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Formulario Completado
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Abrir Formulario de Registro
              </>
            )}
          </button>
          
          {isRegistered && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleConfirm(); }}
              className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-lg"
            >
              Continuar a la Aplicación
            </button>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Sus datos se procesan de forma segura por Google Forms.
        </p>
      </div>
    </form>
  );
};

export default RegistrationModal;