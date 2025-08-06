import { motion } from "framer-motion";

const StepHeader = () => {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
    >
      <motion.div
        className="relative mx-auto mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.img
          src={`${import.meta.env.BASE_URL}Logo_mark.svg`}
          alt="Logo"
          className="w-16 h-16 rounded-full shadow-lg mx-auto"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            rotate: {
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        />
      </motion.div>

      <motion.h1
        className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Inscrivez-vous gratuitement sur Formafusion
      </motion.h1>

      <motion.p
        className="text-gray-600 dark:text-gray-300 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        Plateforme collaborative de gestion de formation
      </motion.p>
    </motion.div>
  );
};

export default StepHeader;
