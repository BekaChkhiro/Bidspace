import { useToast } from '../ui/use-toast';

const useCustomToast = () => {
  const { toast } = useToast();

  const showToast = (message) => {
    toast({
      description: message,
      className: "bg-white/70 border-[#e5e5e5] text-black",
      style: {
        background: 'rgba(255, 255, 255, 0.73)',
        borderRadius: '16px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        border: '1px solid #e5e5e5',
        color: 'black',
        maxWidth: '400px',
        width: '100%',
        position: 'fixed',
        right: '20px',
        bottom: '20px'
      }
    });
  };

  return showToast;
};

export default useCustomToast;
