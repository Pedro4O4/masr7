"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import AOS from 'aos';
import 'aos/dist/aos.css';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { FaTicketAlt, FaUsers, FaCalendarAlt, FaStar, FaTheaterMasks, FaTrophy, FaMusic, FaPalette } from 'react-icons/fa';
import '../app/globals.css';
import '@/components/homepage/Homepage.css';
import { Event } from '@/types/event';
import EventCard from '@/components/Event Components/EventCard';

const Homepage: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { ref: statsRef, inView: statsInView } = useInView({
    triggerOnce: true,
    threshold: 0.3
  });

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    });
  }, []);

  const isLoggedIn = () => {
    return typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true';
  };

  useEffect(() => {
    api.get<any>('/event/approved')
      .then(response => {
        const data = response.data.success ? response.data.data : response.data;
        if (data && Array.isArray(data)) {
          setFeaturedEvents(data);
        } else {
          setError('No events found');
          setFeaturedEvents([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
        setFeaturedEvents([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading-indicator">Loading...</div>;
  }

  return (
    <div className="homepage-container">
      <div className="hero-section" style={{
        background: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://th.bing.com/th/id/OIP.GcQyOsMVDtUUhTTMmTjY0wHaEJ?w=626&h=351&rs=1&pid=ImgDetMain")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="hero-content" data-aos="fade-up">
          <h1 className="hero-title" data-aos="fade-down" data-aos-delay="200">Experience the Magic of Live Performance</h1>
          <p className="hero-subtitle" data-aos="fade-up" data-aos-delay="400">Discover extraordinary events that will leave you breathless</p>
          <div className="hero-buttons" data-aos="zoom-in" data-aos-delay="600">
            <Link href="/events" className="btn-primary-hero">Browse Events</Link>
            {!isLoggedIn() && (
              <Link href="/register" className="btn-secondary-hero">Get Started</Link>
            )}
          </div>
        </div>
      </div>

      <section className="stats-section" ref={statsRef} data-aos="fade-up">
        <div className="stats-container">
          <div className="stat-item" data-aos="flip-left" data-aos-delay="100">
            <FaTicketAlt className="stat-icon" />
            <h3>{statsInView ? <CountUp end={50000} duration={2.5} separator="," /> : '0'}</h3>
            <p>Tickets Sold</p>
          </div>
          <div className="stat-item" data-aos="flip-left" data-aos-delay="200">
            <FaUsers className="stat-icon" />
            <h3>{statsInView ? <CountUp end={10000} duration={2.5} separator="," /> : '0'}+</h3>
            <p>Happy Customers</p>
          </div>
          <div className="stat-item" data-aos="flip-left" data-aos-delay="300">
            <FaCalendarAlt className="stat-icon" />
            <h3>{statsInView ? <CountUp end={500} duration={2.5} /> : '0'}+</h3>
            <p>Events Hosted</p>
          </div>
          <div className="stat-item" data-aos="flip-left" data-aos-delay="400">
            <FaStar className="stat-icon" />
            <h3>{statsInView ? <CountUp end={4.8} duration={2.5} decimals={1} /> : '0'}</h3>
            <p>Average Rating</p>
          </div>
        </div>
      </section>

      <section className="features-section" data-aos="fade-up">
        <h2 className="section-title" data-aos="fade-down" data-aos-duration="1000">Why Choose EventTix?</h2>
        <div className="features-grid">
          <div className="feature-card" data-aos="fade-up" data-aos-delay="100" data-aos-duration="800">
            <div className="feature-icon"><FaTheaterMasks /></div>
            <h3>Premium Events</h3>
            <p>Access to the most exclusive and highly-rated events in your area</p>
          </div>
          <div className="feature-card" data-aos="fade-up" data-aos-delay="200" data-aos-duration="800">
            <div className="feature-icon"><FaTrophy /></div>
            <h3>Best Prices</h3>
            <p>Competitive pricing with no hidden fees. What you see is what you pay</p>
          </div>
          <div className="feature-card" data-aos="fade-up" data-aos-delay="300" data-aos-duration="800">
            <div className="feature-icon"><FaMusic /></div>
            <h3>Diverse Selection</h3>
            <p>From concerts to theater, sports to festivals - we have it all</p>
          </div>
          <div className="feature-card" data-aos="fade-up" data-aos-delay="400" data-aos-duration="800">
            <div className="feature-icon"><FaPalette /></div>
            <h3>Easy Booking</h3>
            <p>Simple, fast, and secure booking process in just a few clicks</p>
          </div>
        </div>
      </section>

      <section className="featured-section" data-aos="fade-up">
        <h2 className="section-title" data-aos="fade-down">Featured Shows</h2>
        {error ? (
          <div className="error-message">{error}</div>
        ) : featuredEvents.length === 0 ? (
          <div className="no-events-message">No events available at the moment.</div>
        ) : (
          <div className="events-grid">
            {featuredEvents.map((event, index) => (
              <div key={event._id || (event as any).id} data-aos="fade-up" data-aos-delay={index * 100}>
                <EventCard event={event} index={index} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Homepage;
