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
    ...opts,
    align: 'start',
  })

  return (
    <CarouselContext.Provider value={{ emblaRef, emblaApi }}>
      <div ref={emblaRef} className={className}>
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

export function CarouselContent({ className, children }) {
  return (
    <div className={`flex ${className || ''}`}>
      {children}
    </div>
  )
}

export function CarouselItem({ className, children }) {
  return (
    <div className={`min-w-0 shrink-0 ${className || ''}`}>
      {children}
    </div>
  )
}
