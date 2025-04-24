import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import Modal from '../common/Modal';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-gray-800 px-4 sm:px-6 py-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center">
            <span className="text-xl sm:text-2xl font-bold text-white military-header">SOLDIERS OF WEALTH</span>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-white hover:text-gray-300 focus:outline-none"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4">
            <a href="#how-to-play" className="px-4 py-2 text-white hover:text-gray-300">How to Play</a>
            <a href="#testimonials" className="px-4 py-2 text-white hover:text-gray-300">Testimonials</a>
            <Link to="/signup" className="px-4 py-2 button-military rounded">Sign Up</Link>
            <Link to="/login" className="px-4 py-2 button-gold rounded">Login</Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden mt-4 pb-4`}>
          <div className="flex flex-col space-y-2">
            <a href="#how-to-play" className="px-4 py-2 text-white hover:text-gray-300" onClick={toggleMobileMenu}>How to Play</a>
            <a href="#testimonials" className="px-4 py-2 text-white hover:text-gray-300" onClick={toggleMobileMenu}>Testimonials</a>
            <Link to="/signup" className="px-4 py-2 button-military rounded text-center" onClick={toggleMobileMenu}>Sign Up</Link>
            <Link to="/login" className="px-4 py-2 button-gold rounded text-center" onClick={toggleMobileMenu}>Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="h-[400px] sm:h-[500px] relative">
          <img 
            src="/images/general_patton_promo.jpeg" 
            alt="General Patton" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 military-header">THE ULTIMATE FINANCIAL STRATEGY GAME</h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8">
            Lead your soldiers to wealth through strategic investments, defend your assets, 
            and conquer your opponents in this 4-week battle of financial supremacy.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button onClick={() => navigate('/signup')} className="px-6 py-3 button-military rounded-md text-lg w-full sm:w-auto">
              Join the Battle
            </button>
            <button onClick={() => setShowComingSoon(true)} className="px-6 py-3 button-gold rounded-md text-lg w-full sm:w-auto">
              Watch Gameplay
            </button>
          </div>
        </div>
      </div>

      {/* Game Features */}
      <div id="how-to-play" className="p-4 sm:p-8 bg-gray-900">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 military-header text-white">HOW TO PLAY</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-8 sm:mb-12">
          <div className="game-card p-6 rounded-lg text-center">
            <div className="h-16 w-16 bg-military rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gold">1</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Command Your Army</h3>
            <p className="text-gray-400">Start with 100 soldiers and receive 50 new recruits each week. Deploy them strategically to grow your wealth.</p>
          </div>
          
          <div className="game-card p-6 rounded-lg text-center">
            <div className="h-16 w-16 bg-finance rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gold">2</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Invest Wisely</h3>
            <p className="text-gray-400">Choose between stocks, real estate, crypto, and business investments. Each has unique risk and reward profiles.</p>
          </div>
          
          <div className="game-card p-6 rounded-lg text-center">
            <div className="h-16 w-16 bg-danger rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gold">3</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Attack & Defend</h3>
            <p className="text-gray-400">Launch strategic attacks on opponents to capture their soldiers, or build defenses to protect your wealth.</p>
          </div>
          
          <div className="game-card p-6 rounded-lg text-center">
            <div className="h-16 w-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-dark">4</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Adapt & Conquer</h3>
            <p className="text-gray-400">Navigate economic shifts, special events, and form strategic alliances to dominate the battlefield.</p>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="text-center px-4">
          <p className="text-lg sm:text-xl mb-6">Ready to prove your financial strategy skills?</p>
          <button onClick={() => navigate('/signup')} className="px-6 py-3 sm:px-8 sm:py-4 button-military rounded-md text-lg sm:text-xl w-full sm:w-auto">
            JOIN THE NEXT BATTLE
          </button>
        </div>
      </div>

      {/* Testimonials */}
      <div id="testimonials" className="p-4 sm:p-8 bg-gray-800">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 military-header text-white">COMMANDER TESTIMONIALS</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-900 p-6 rounded-lg">
            <p className="italic text-gray-400 mb-4">"The most engaging strategy game I've played. It's not just about luck—your financial decisions actually matter!"</p>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-military flex items-center justify-center mr-4">
                <span className="text-gold font-bold">G</span>
              </div>
              <div>
                <p className="font-bold">Commander Grace</p>
                <p className="text-sm text-gray-500">Week 2 Champion</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg">
            <p className="italic text-gray-400 mb-4">"I've learned more about investment strategy from this game than from months of reading finance books. And it's actually fun!"</p>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-military flex items-center justify-center mr-4">
                <span className="text-gold font-bold">R</span>
              </div>
              <div>
                <p className="font-bold">Commander Romado</p>
                <p className="text-sm text-gray-500">Crypto Specialist</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg">
            <p className="italic text-gray-400 mb-4">"The perfect blend of strategy, timing, and risk management. I'm using tactics from this game in my real investment portfolio!"</p>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-military flex items-center justify-center mr-4">
                <span className="text-gold font-bold">C</span>
              </div>
              <div>
                <p className="font-bold">Commander Charles</p>
                <p className="text-sm text-gray-500">Season 1 Winner</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 p-4 sm:p-8 border-t border-gray-800">
        <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row justify-between items-center max-w-6xl mx-auto">
          <div className="text-center md:text-left">
            <span className="text-xl sm:text-2xl font-bold military-header text-gold">SOLDIERS OF WEALTH</span>
            <p className="text-gray-500 mt-2"> 2025 Soldiers of Wealth. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <a href="#how-to-play" className="text-gray-400 hover:text-white">How to Play</a>
            <a href="#testimonials" className="text-gray-400 hover:text-white">Testimonials</a>
            <Link to="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link>
            <Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>
            <Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <Modal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
      >
        <div className="bg-gray-900 text-white p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">COMING SOON!</h2>
          <p className="text-gray-300 mb-6">
            Our gameplay videos are currently in production. Stay tuned, Commander!
          </p>
          <button
            onClick={() => setShowComingSoon(false)}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            UNDERSTOOD
          </button>
        </div>
      </Modal>
    </div>
  );
}
