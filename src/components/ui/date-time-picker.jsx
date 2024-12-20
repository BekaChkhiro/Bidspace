import * as React from "react"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { ScrollArea } from "./scroll-area"
import { cn } from "../../lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ka } from 'date-fns/locale'

export function DateTimePicker({
  date,
  setDate,
  className,
  disabled,
  ...props
}) {
  const [selectedDateTime, setSelectedDateTime] = React.useState(date ? new Date(date) : null)
  const [isOpen, setIsOpen] = React.useState(false)

  const hours = Array.from({ length: 24 }, (_, i) => 23 - i)
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35]

  const handleSelect = (selected) => {
    if (selected) {
      const newDateTime = selectedDateTime ? new Date(selectedDateTime) : new Date()
      newDateTime.setFullYear(selected.getFullYear())
      newDateTime.setMonth(selected.getMonth())
      newDateTime.setDate(selected.getDate())
      setSelectedDateTime(newDateTime)
      setDate(format(newDateTime, "yyyy-MM-dd'T'HH:mm"))
    }
  }

  const handleTimeChange = (type, value) => {
    if (selectedDateTime) {
      const newDateTime = new Date(selectedDateTime)
      if (type === "hour") {
        newDateTime.setHours(parseInt(value))
      } else if (type === "minute") {
        newDateTime.setMinutes(parseInt(value))
      }
      setSelectedDateTime(newDateTime)
      setDate(format(newDateTime, "yyyy-MM-dd'T'HH:mm"))
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDateTime && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDateTime ? (
            format(selectedDateTime, "dd/MM/yyyy HH:mm", { locale: ka })
          ) : (
            <span>აირჩიეთ თარიღი და დრო</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <Calendar
            mode="single"
            selected={selectedDateTime}
            onSelect={handleSelect}
            initialFocus
          />
          <div className="flex border-l">
            <ScrollArea className="h-[278px] px-1">
              <div className="flex flex-col py-2">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    size="sm"
                    variant={selectedDateTime && selectedDateTime.getHours() === hour ? "default" : "ghost"}
                    className="px-2 py-1.5 h-8 w-12"
                    onClick={() => handleTimeChange("hour", hour)}
                  >
                    {hour.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <ScrollArea className="h-[278px] px-1">
              <div className="flex flex-col py-2">
                {minutes.map((minute) => (
                  <Button
                    key={minute}
                    size="sm"
                    variant={selectedDateTime && selectedDateTime.getMinutes() === minute ? "default" : "ghost"}
                    className="px-2 py-1.5 h-8 w-12"
                    onClick={() => handleTimeChange("minute", minute)}
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
