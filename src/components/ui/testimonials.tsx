'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Jason M.',
    role: 'Domain Investor',
    avatar: 'https://i.pravatar.cc/100?u=jason-m',
    quote: 'Finally, a no-hassle way to sell domains I\'m not renewing. Listed 12 domains in 5 minutes, sold 3 within a week.',
    rating: 5,
  },
  {
    name: 'Sarah K.',
    role: 'Startup Founder',
    avatar: 'https://i.pravatar.cc/100?u=sarah-k',
    quote: 'Found the perfect domain for my SaaS at $99. Would have paid 10x on other marketplaces. Love the fixed pricing model.',
    rating: 5,
  },
  {
    name: 'David R.',
    role: 'Web Developer',
    avatar: 'https://i.pravatar.cc/100?u=david-r',
    quote: 'The AI scoring helped me spot a gem before anyone else. Transfer was smooth and the escrow gave me peace of mind.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Trusted by Domain Buyers & Sellers
          </h2>
          <p className="text-gray-500">See what our community is saying</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              {/* Quote */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={44}
                  height={44}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
