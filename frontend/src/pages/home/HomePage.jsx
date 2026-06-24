import BestSellersSection from './components/BestSellersSection';
import BrandsStrip from './components/BrandsStrip';
import CategoriesSection from './components/CategoriesSection';
import CombosSection from './components/CombosSection';
import HeroSection from './components/HeroSection';
import WhyUsSection from './components/WhyUsSection';

const HomePage = () => {
  return (
    <div className="bg-dark-base min-h-screen">
      <HeroSection />
      <BrandsStrip />
      <CategoriesSection />
      <BestSellersSection />
      <CombosSection />
      <WhyUsSection />
    </div>
  );
};

export default HomePage;
