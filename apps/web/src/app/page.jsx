import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Package, 
  Truck, 
  Plane, 
  Ship, 
  Warehouse, 
  Clock, 
  Shield, 
  Globe, 
  Star, 
  ArrowRight,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  X
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { ClientOnly } from './root';
import Navigation from '../components/Navigation';

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const [trackingCode, setTrackingCode] = useState(searchParams.get('track') || '');
  const [trackingResult, setTrackingResult] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    callbackRequested: false
  });
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    origin: '',
    destination: '',
    description: ''
  });

  // Tracking mutation
  const trackingMutation = useMutation({
    mutationFn: async (code) => {
      const response = await fetch(`/api/tracking?code=${encodeURIComponent(code)}`);
      if (!response.ok) {
        throw new Error('Tracking code not found');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setTrackingResult(data);
    },
    onError: (error) => {
      setTrackingResult({ error: error.message });
    }
  });

  // Contact form mutation
  const contactMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error('Failed to submit contact form');
      }
      return response.json();
    },
    onSuccess: () => {
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        callbackRequested: false
      });
      alert('Thank you for your message. We will get back to you soon!');
    },
    onError: () => {
      alert('Failed to submit contact form. Please try again.');
    }
  });

  // Quote form mutation
  const quoteMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error('Failed to submit quote request');
      }
      return response.json();
    },
    onSuccess: () => {
      setQuoteForm({
        name: '',
        email: '',
        phone: '',
        serviceType: '',
        origin: '',
        destination: '',
        description: ''
      });
      alert('Quote request submitted successfully! Our team will contact you within 24 hours.');
    },
    onError: () => {
      alert('Failed to submit quote request. Please try again.');
    }
  });

  useEffect(() => {
    const trackCode = searchParams.get('track');
    if (trackCode) {
      trackingMutation.mutate(trackCode);
      setTimeout(() => {
        document.getElementById('tracking')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [searchParams]);

  const handleTrackingSubmit = (e) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      trackingMutation.mutate(trackingCode.trim());
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    contactMutation.mutate(contactForm);
  };

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    quoteMutation.mutate(quoteForm);
  };

  const services = [
    {
      id: 'air-freight',
      title: 'Air Freight',
      icon: Plane,
      description: 'Fast and reliable air cargo services worldwide',
      features: ['Express delivery', 'Global coverage', 'Real-time tracking', 'Customs clearance'],
      details: 'Our air freight services ensure your cargo reaches its destination quickly and safely. With partnerships with major airlines worldwide, we offer competitive rates and flexible scheduling.'
    },
    {
      id: 'sea-freight',
      title: 'Sea Freight',
      icon: Ship,
      description: 'Cost-effective ocean shipping solutions',
      features: ['FCL & LCL options', 'Port-to-port delivery', 'Container tracking', 'Documentation'],
      details: 'Sea freight offers the most economical solution for large shipments. Our extensive network of shipping partners ensures reliable transit times and competitive pricing for all your ocean cargo needs.'
    },
    {
      id: 'land-transport',
      title: 'Land Transport',
      icon: Truck,
      description: 'Efficient ground transportation networks',
      features: ['Door-to-door service', 'Regional coverage', 'Flexible scheduling', 'Secure transport'],
      details: 'Our land transport network covers major routes across continents. Whether you need local delivery or cross-border transportation, our fleet ensures timely and secure delivery of your goods.'
    },
    {
      id: 'warehousing',
      title: 'Warehousing',
      icon: Warehouse,
      description: 'Secure storage and distribution facilities',
      features: ['Climate controlled', '24/7 security', 'Inventory management', 'Pick & pack'],
      details: 'State-of-the-art warehousing facilities with advanced inventory management systems. Our warehouses are strategically located to optimize your supply chain and reduce distribution costs.'
    }
  ];

  const trustBadges = [
    { icon: Shield, text: 'ISO Certified' },
    { icon: Globe, text: 'Global Network' },
    { icon: Clock, text: '24/7 Support' },
    { icon: Star, text: '99.9% Reliability' }
  ];

  const partnerLogos = [
    'DHL', 'FedEx', 'UPS', 'Maersk', 'COSCO', 'MSC', 'Emirates', 'Lufthansa'
  ];

  const offices = [
    {
      name: 'Head Office (USA)',
      address: '300 N Lake Avenue, Suite 400, Pasadena, CA 91101, USA',
      lat: 34.1478,
      lng: -118.1445
    },
    {
      name: 'Dubai Office',
      address: 'One Central, Dubai World Trade Centre, UAE',
      lat: 25.2322,
      lng: 55.3217
    },
    {
      name: 'London Office (UK)',
      address: '30 Churchill Place, Canary Wharf, E14 5RE, UK',
      lat: 51.5074,
      lng: -0.0278
    },
    {
      name: 'Frankfurt Office (Germany)',
      address: 'MesseTurm, Friedrich-Ebert-Anlage 49, 60308 Frankfurt am Main, Germany',
      lat: 50.1109,
      lng: 8.6821
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-green-900/90 z-10" />
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-green-600" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            SwiftshipExpress
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-12 leading-relaxed"
          >
            Connecting the World, One Shipment at a Time
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('tracking')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl text-lg"
            >
              Track Your Shipment
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowServiceModal('quote')}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-xl hover:shadow-2xl text-lg"
            >
              Request a Quote
            </motion.button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          >
            {trustBadges.map((badge, index) => {
              const IconComponent = badge.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="flex flex-col items-center text-white/80 hover:text-white transition-colors duration-300"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-3">
                    <IconComponent size={24} className="md:w-8 md:h-8" />
                  </div>
                  <span className="text-sm md:text-base font-medium">{badge.text}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Partner Logos */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center text-gray-600 dark:text-gray-400 mb-8 text-lg"
          >
            Trusted by leading logistics partners worldwide
          </motion.p>
          
          <div className="flex items-center justify-center overflow-hidden">
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: '-100%' }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="flex space-x-12 whitespace-nowrap"
            >
              {[...partnerLogos, ...partnerLogos].map((logo, index) => (
                <div
                  key={index}
                  className="text-2xl md:text-3xl font-bold text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 flex-shrink-0"
                >
                  {logo}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tracking Section */}
      <section id="tracking" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Track Your Shipment
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Enter your tracking code to get real-time updates on your shipment
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleTrackingSubmit}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Enter tracking code (e.g., SWE001234)"
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={trackingMutation.isLoading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {trackingMutation.isLoading ? 'Tracking...' : 'Track'}
            </motion.button>
          </motion.form>

          {/* Tracking Results */}
          {trackingResult && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 md:p-8 shadow-xl"
            >
              {trackingResult.error ? (
                <div className="text-center text-red-600 dark:text-red-400">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">{trackingResult.error}</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {trackingResult.tracking_code}
                    </h3>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      trackingResult.status === 'Delivered' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {trackingResult.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">From</h4>
                      <p className="text-gray-600 dark:text-gray-400">{trackingResult.origin_address}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">To</h4>
                      <p className="text-gray-600 dark:text-gray-400">{trackingResult.destination_address}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Progress</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{trackingResult.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${trackingResult.progress_percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="bg-gradient-to-r from-blue-600 to-green-600 h-3 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Premium Vertical Timeline */}
                  <div className="relative mt-12 pl-6 md:pl-8">
                    {/* Vertical connecting line */}
                    <div className="absolute left-8 md:left-10 top-2 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    
                    <div className="space-y-8 relative">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-6 -ml-6 md:-ml-8">Shipment Timeline</h4>
                      {trackingResult.timeline?.map((step, index) => {
                        const isLastCompleted = step.completed && (!trackingResult.timeline[index + 1] || !trackingResult.timeline[index + 1].completed);
                        
                        return (
                          <motion.div 
                            key={index} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="relative flex items-start group"
                          >
                            {/* Node icon / dot */}
                            <div className="absolute -left-10 md:-left-12 flex items-center justify-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors duration-300 ${
                                step.completed 
                                  ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                                  : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600'
                              } ${isLastCompleted ? 'ring-4 ring-green-100 dark:ring-green-900/50' : ''}`}>
                                {step.completed && <CheckCircle size={16} strokeWidth={3} />}
                              </div>
                            </div>
                            
                            {/* Step Content */}
                            <div className="flex-1 ml-4 md:ml-2">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                                <h5 className={`text-lg font-bold ${
                                  step.completed 
                                    ? 'text-gray-900 dark:text-white' 
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  {step.status}
                                </h5>
                                {step.timestamp && (
                                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1 sm:mt-0">
                                    {new Date(step.timestamp).toLocaleString(undefined, {
                                      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm ${
                                step.completed ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                              }`}>
                                {step.completed ? 'Shipment successfully passed this checkpoint.' : 'Awaiting status update.'}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive logistics solutions tailored to your business needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  onClick={() => setShowServiceModal(service)}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent size={32} className="text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                    Learn more
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                About SwiftshipExpress
              </h2>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                From local shipments to global freight, SwiftshipExpress is redefining logistics with speed, safety, and innovation.
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Our Mission</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    To provide seamless, reliable, and innovative logistics solutions that connect businesses and people across the globe.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Our Vision</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    To be the world's most trusted logistics partner, enabling global commerce through cutting-edge technology and exceptional service.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Our Values</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Reliability, innovation, sustainability, and customer-centricity drive everything we do.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                  Global Presence
                </h3>
                
                <div className="h-80 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Global Office Locations</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {offices.map((office, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin size={16} className="text-blue-600 dark:text-blue-400" />
                            <span>{office.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  {offices.map((office, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <MapPin size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{office.name}</p>
                        <p className="text-gray-600 dark:text-gray-400">{office.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Us
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Get in touch with our logistics experts
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Get in Touch
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Mail className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email</p>
                      <p className="text-gray-600 dark:text-gray-400">support@swift-ship-express.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Phone className="text-green-600 dark:text-green-400" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Phone</p>
                      <p className="text-gray-600 dark:text-gray-400">+1 (415) 718 6206</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                      <MessageCircle className="text-orange-600 dark:text-orange-400" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">WhatsApp Support</p>
                      <p className="text-gray-600 dark:text-gray-400">+1 (415) 718 6206</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="h-64 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 relative flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={48} className="mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    123 Express Lane, Suite 100<br />
                    Los Angeles, CA 90001
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <form onSubmit={handleContactSubmit} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Send us a Message
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      placeholder="Your Name"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      placeholder="Your Email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      placeholder="Subject"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      placeholder="Your Message"
                      rows={4}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="callback"
                      checked={contactForm.callbackRequested}
                      onChange={(e) => setContactForm({...contactForm, callbackRequested: e.target.checked})}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="callback" className="text-sm text-gray-600 dark:text-gray-400">
                      Request a callback
                    </label>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={contactMutation.isLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {contactMutation.isLoading ? 'Sending...' : 'Send Message'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Truck size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold">SwiftshipExpress</span>
              </div>
              <p className="text-gray-400 mb-4">
                Connecting the world, one shipment at a time.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Air Freight</li>
                <li>Sea Freight</li>
                <li>Land Transport</li>
                <li>Warehousing</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>News</li>
                <li>Contact</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Track Shipment</li>
                <li>Help Center</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SwiftshipExpress. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Service Modal */}
      {showServiceModal && typeof showServiceModal === 'object' && showServiceModal.title && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowServiceModal(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {showServiceModal.title}
              </h3>
              <button
                onClick={() => setShowServiceModal(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {showServiceModal.details}
            </p>
            
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Features:</h4>
              <ul className="space-y-2">
                {showServiceModal.features?.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <button
              onClick={() => {
                setShowServiceModal(null);
                setShowServiceModal('quote');
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
            >
              Get Quote for {showServiceModal.title}
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Quote Modal */}
      {showServiceModal === 'quote' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowServiceModal(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Request a Quote
              </h3>
              <button
                onClick={() => setShowServiceModal(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              <input
                type="text"
                value={quoteForm.name}
                onChange={(e) => setQuoteForm({...quoteForm, name: e.target.value})}
                placeholder="Your Name"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              
              <input
                type="email"
                value={quoteForm.email}
                onChange={(e) => setQuoteForm({...quoteForm, email: e.target.value})}
                placeholder="Your Email"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              
              <input
                type="tel"
                value={quoteForm.phone}
                onChange={(e) => setQuoteForm({...quoteForm, phone: e.target.value})}
                placeholder="Phone Number"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              
              <select
                value={quoteForm.serviceType}
                onChange={(e) => setQuoteForm({...quoteForm, serviceType: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select Service Type</option>
                <option value="Air Freight">Air Freight</option>
                <option value="Sea Freight">Sea Freight</option>
                <option value="Land Transport">Land Transport</option>
                <option value="Warehousing">Warehousing</option>
              </select>
              
              <input
                type="text"
                value={quoteForm.origin}
                onChange={(e) => setQuoteForm({...quoteForm, origin: e.target.value})}
                placeholder="Origin Address"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              
              <input
                type="text"
                value={quoteForm.destination}
                onChange={(e) => setQuoteForm({...quoteForm, destination: e.target.value})}
                placeholder="Destination Address"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              
              <textarea
                value={quoteForm.description}
                onChange={(e) => setQuoteForm({...quoteForm, description: e.target.value})}
                placeholder="Additional Details (weight, dimensions, special requirements)"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={quoteMutation.isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {quoteMutation.isLoading ? 'Submitting...' : 'Submit Quote Request'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}