import Navbar from "../../../components1/common/Navbar/Navbar";
import AboutSection from "../../../components1/user/Home/AboutSection";
import AboutUsSection from "../../../components1/user/Home/AboutUsSection";
import Footer from "../../../components1/user/Home/Footer";
import HeroSection from "../../../components1/user/Home/HeroSection";
import NetworkSection from "../../../components1/user/Home/NetworkSection";
import SearchBar from "../../../components1/user/Home/SearchBar";
import SolutionsSection from "../../../components1/user/Home/SolutionsSection";

const Home = () => {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <HeroSection />
      <SearchBar />
      <SolutionsSection />
      <AboutSection />
      <NetworkSection />
      <AboutUsSection />
      <Footer />
    </div>
  );
};

export default Home;
