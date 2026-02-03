'use client';

import { Star, Quote } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from './motion';

const testimonials = [
  {
    name: 'Jason M.',
    role: 'Domain Investor',
    initials: 'JM',
    gradient: 'from-violet-500 to-purple-600',
    quote: 'Finally, a no-hassle way to sell domains I\'m not renewing. Listed 12 domains in 5 minutes, sold 3 within a week.',
    rating: 5,
  },
  {
    name: 'Sarah K.',
    role: 'Startup Founder',
    initials: 'SK',
    gradient: 'from-amber-500 to-orange-600',
    quote: 'Found the perfect domain for my SaaS at $99. Would have paid 10x on other marketplaces. Love the fixed pricing model.',
    rating: 5,
  },
  {
    name: 'David R.',
    role: 'Web Developer',
    initials: 'DR',
    gradient: 'from-emerald-500 to-teal-600',
    quote: 'The AI scoring helped me spot a gem before anyone else. Transfer was smooth and the escrow gave me peace of mind.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#faf9f7] via-[#fdfcfa] to-[#faf9f7] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Trusted by Domain Buyers & Sellers
          </h2>
          <p className="text-gray-500 text-lg">See what our community is saying</p>
        </FadeIn>
        
        <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
          {testimonials.map((testimonial, index) => (
            <StaggerItem key={index}>
              <div className="relative bg-[#fdfcfa] rounded-2xl p-8 shadow-xl shadow-gray-900/5 border border-gray-200/60 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all duration-300 h-full">
                {/* Decorative quote icon */}
                <div className="absolute -top-4 -left-2 w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center">
                  <Quote className="w-5 h-5 text-primary-500" />
                </div>
                
                {/* Stars */}
                <div className="flex gap-1 mb-5 pt-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                {/* Quote */}
                <blockquote className="text-gray-700 mb-8 leading-relaxed text-lg">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                
                {/* Author */}
                <div className="flex items-center gap-4">
                  {/* Gradient initial avatar */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-sm tracking-tight">
                      {testimonial.initials}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
