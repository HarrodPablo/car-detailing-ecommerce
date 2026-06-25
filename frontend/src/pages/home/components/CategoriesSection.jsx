const CategoriesSection = () => {
  // TODO: reemplazar imagenes con Cloudinary URLs
  const categories = [
    {
      id: 1,
      title: "Lavado",
      productsCount: 42,
      image: "https://i.ibb.co/d4mx54Nm/Gemini-Generated-Image-kwhqfgkwhqfgkwhq.png",
      isLarge: true
    },
    {
      id: 2,
      title: "Corrección de Pintura",
      productsCount: 38,
      image: "https://i.ibb.co/ZpFVc2rf/Gemini-Generated-Image-1bwou11bwou11bwo.png",
      isLarge: true
    },
    {
      id: 3,
      title: "Ceras & Selladores",
      productsCount: 56,
      image: "https://i.ibb.co/q3T19L4v/Gemini-Generated-Image-4voez14voez14voe.png",
      isLarge: false
    },
    {
      id: 4,
      title: "Exterior",
      productsCount: 24,
      image: "https://i.ibb.co/mFdDVWCX/Gemini-Generated-Image-arnn9zarnn9zarnn.png",
      isLarge: false
    },
    {
      id: 5,
      title: "Interior",
      productsCount: 89,
      image: "https://i.ibb.co/HDVftTnz/Gemini-Generated-Image-b9f79lb9f79lb9f7.png",
      isLarge: false
    },
    {
      id: 6,
      title: "Accesorios Detailing",
      productsCount: 12,
      image: "https://i.ibb.co/NgXSywtD/Gemini-Generated-Image-p242kjp242kjp242.png",
      isLarge: false
    }
  ];

  const CategoryCard = ({ category }) => (
    <div
      className={`relative group overflow-hidden rounded-xl bg-dark-card border border-dark-border cursor-pointer 
      ${category.isLarge ? 'col-span-1 md:col-span-2 aspect-[4/3] md:aspect-auto' : 'col-span-1 aspect-[4/5]'}`}
    >
      {/* Background Image with Zoom Effect */}
      <img
        src={category.image}
        alt={category.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Bottom Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-base via-dark-base/50 to-transparent opacity-80"></div>

      {/* Top Right Icon (Glassmorphism) */}
      <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors group-hover:bg-brand/80 group-hover:border-brand">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>

      {/* Bottom Left Content */}
      <div className="absolute bottom-6 left-6">
        <h3 className="text-2xl font-heading font-bold text-white mb-1 group-hover:text-brand transition-colors">
          {category.title}
        </h3>
        <p className="text-gray-400 font-sans text-sm">
          {category.productsCount} Productos
        </p>
      </div>
    </div>
  );

  return (
    <section className="bg-dark-base py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <p className="text-brand font-sans font-semibold uppercase tracking-wider text-sm mb-2">
              Explorá por categoría
            </p>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white uppercase">
              Nuestros <span className="text-gray-500">Productos</span>
            </h2>
          </div>
          <button className="text-white hover:text-brand transition-colors font-sans font-medium flex items-center gap-2 group">
            Ver todo el catálogo
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Top Large Cards */}
          <div className="col-span-1 sm:col-span-2 md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[300px]">
            {categories.filter(c => c.isLarge).map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>

          {/* Bottom Small Cards */}
          {categories.filter(c => !c.isLarge).map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
