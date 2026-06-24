export const printRemito = () => {
  const remitoEl = document.getElementById('remito-print');
  if (!remitoEl) return;
  
  const clone = remitoEl.cloneNode(true);
  
  const wrapper = document.createElement('div');
  wrapper.id = 'print-wrapper';
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  const style = document.createElement('style');
  style.id = 'remito-print-style';
  style.innerHTML = `
    @media print {
      body > *:not(#print-wrapper) { display: none !important; }
      #print-wrapper { 
        display: block !important; 
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `;
  document.head.appendChild(style);
  
  window.print();
  
  setTimeout(() => {
    document.getElementById('remito-print-style')?.remove();
    wrapper.remove();
  }, 1000);
};
