/**
 * Service to handle community registration / usage tracking.
 * This corresponds to what the user refers to as "registro de descargas/instalaciones".
 */
export const registerCommunity = async (projectInfo: ProjectInfo): Promise<void> => {
    try {
        console.log("Iniciando registro de comunidad/uso...", projectInfo.communityName);

        // NOTE: Replace 'YOUR_WEBHOOK_URL' with a real URL (e.g., Discord or Make.com)
        // to track installations and usage active.
        const trackingUrl = (import.meta as any).env?.VITE_REGISTRATION_WEBHOOK || '';

        if (trackingUrl) {
            await fetch(trackingUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                mode: 'no-cors', // Use no-cors to avoid blocking if the endpoint doesn't support CORS
                body: JSON.stringify({
                    type: 'app_registration',
                    community: projectInfo.communityName,
                    consultation: projectInfo.consultationNumber,
                    year: projectInfo.year,
                    timestamp: new Date().toISOString(),
                    platform: typeof window !== 'undefined' ? (window as any).navigator?.userAgent : 'Electron'
                })
            });
            console.log("Registro de uso enviado correctamente.");
        } else {
            console.log("Registro de uso simulado (VITE_REGISTRATION_WEBHOOK no configurado).");
        }

    } catch (error) {
        console.error("Error al registrar el uso:", error);
    }
};
