import React from "react"
import useEmblaCarousel from "embla-carousel-react"

const CarouselContext = React.createContext(null)

export function Carousel({
  opts,
  className,
  children,
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    align: "start",
    breakpoints: {
      '(min-width: 1024px)': { slidesToShow: 3.5 },
      '(min-width: 768px)': { slidesToShow: 2.5 },
      '(max-width: 767px)': { slidesToShow: 2.5 }  // შეცვლილი 1.5-დან 2.5-მდე
    },
    ...opts,
  })

  return (
    <CarouselContext.Provider value={{ emblaRef, emblaApi }}>
      <div ref={emblaRef} className={`overflow-hidden ${className || ''}`}>
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

export function CarouselContent({ className, children }) {
  return (
    <div className={`flex -ml-4 ${className || ''}`}>
      {children}
    </div>
  )
}

export function CarouselItem({ className, children }) {
  return (
    <div className={`pl-4 relative w-full shrink-0 
      basis-[40%]        /* შეცვლილი 85%-დან 40%-მდე მობილურისთვის */
      md:basis-[45%] 
      lg:basis-[30%] 
      ${className || ''}`}>
      {children}
    </div>
  )
}
