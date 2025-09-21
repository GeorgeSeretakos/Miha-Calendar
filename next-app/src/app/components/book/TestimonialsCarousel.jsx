'use client';

import testimonials from "@/../public/data/testimonials";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

export default function TestimonialsCarousel() {
  return (
    <div className="relative bg-cover bg-center px-4 flex justify-center items-center py-12 sm:py-16 md:py-20">
      {/* Content */}
      <div className="z-10 w-full">
        {/* Section Title */}
        <div className="max-w-6xl mx-auto">
          <h2 className="title-black text-left">
            Τι λένε για εμάς
          </h2>
          <p className="text-gray-600 mt-2 max-w-xl text-left">
            Μερικά λόγια από ανθρώπους που μας εμπιστεύτηκαν και είδαν τη ζωή τους να αλλάζει.
          </p>
        </div>

        {/* Carousel */}
        <div className="max-w-6xl mx-auto my-10 px-2 sm:px-4">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            pagination={{ clickable: true }}
            loop={true}
            autoplay={{ delay: 10000 }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
          >
            {testimonials.map((r, idx) => (
              <SwiperSlide key={idx} className="flex">
                <div className="bg-white shadow rounded-xl p-4 md:p-5 text-left flex flex-col justify-between flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    {r.avatar ? (
                      <img
                        src={r.avatar}
                        alt={r.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 ${r.color} text-white flex items-center justify-center rounded-full font-bold`}
                      >
                        {r.initial}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{r.name}</span>
                      <span className="text-xs text-gray-500">{r.years}</span>
                    </div>
                    <div className="ml-auto">
                      <img
                        src="/icons/google.png"
                        alt="Google"
                        className="w-5 h-5"
                      />
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="text-yellow-400 mt-2 text-sm md:text-base">
                    {"★".repeat(r.stars)}
                  </div>

                  {/* Review */}
                  <p className="mt-2 text-gray-700 text-sm">{r.text}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style>
        {`
          .swiper-slide {
            display: flex;
            height: auto;
          }
          .swiper-pagination {
            position: relative !important;
            margin-top: 1.5rem;
          }
          .swiper-pagination-bullet {
            background: white !important;
            opacity: 0.4;
          }
          .swiper-pagination-bullet-active {
            background: white !important;
            opacity: 1;
          }
        `}
      </style>
    </div>
  );
}