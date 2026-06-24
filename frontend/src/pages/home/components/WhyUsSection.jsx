const WhyUsSection = () => {
  const features = [
    {
      id: 1,
      title: "ENVÍO A TODO EL PAÍS",
      description: "Despachamos tus pedidos en menos de 24hs a cualquier punto de Argentina con seguimiento en tiempo real.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      id: 2,
      title: "PRODUCTOS ORIGINALES",
      description: "Garantizamos la autenticidad de todas nuestras marcas. Somos representantes oficiales directos de fábrica.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    },
    {
      id: 3,
      title: "ASESORAMIENTO GRATIS",
      description: "Nuestro equipo de detailers profesionales está listo para ayudarte a elegir el producto perfecto para tu necesidad.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      )
    }
  ];

  return (
    <section className="bg-dark-base py-20 pb-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className="bg-dark-card border border-dark-border p-10 rounded-xl flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-dark-base flex items-center justify-center mb-6 border border-dark-border">
                {feature.icon}
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-400 font-sans leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
