import { useLocation } from 'react-router-dom';
import { generateWhatsAppLink } from '../../utils/whatsapp';

export default function WhatsAppButton() {
  const location = useLocation();
  
  // No mostrar en el panel admin
  if (location.pathname.startsWith('/admin')) return null;

  const number = '543813333090'; // +54 Argentina
  const message = '¡Hola! Quería consultar sobre sus productos de car detailing 🚗';
  const link = generateWhatsAppLink(number, message);

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Contactar por WhatsApp"
    >
      {/* Ícono SVG oficial de WhatsApp */}
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
          -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475
          -.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52
          .149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207
          -.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372
          -.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 
          3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118
          .571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.845L.057 23.571
          a.75.75 0 00.921.921l5.726-1.471A11.943 11.943 0 0012 24c6.627 0 12-5.373 
          12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.373l-.36-.214-3.732.978
          .997-3.64-.235-.374A9.818 9.818 0 1112 21.818z"/>
      </svg>

      {/* Anillos de pulso */}
      <span className="whatsapp-ring ring-1" />
      <span className="whatsapp-ring ring-2" />
    </a>
  );
}
