export default function SewingMachineIcon({ className = 'w-8 h-8', white = true, style = {} }) {
  return (
    <img
      src="/meru-sewing.png"
      alt="Meru Sewing Machine"
      className={`${className} object-contain`}
      style={{
        filter: white ? 'brightness(0) invert(1)' : 'none',
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
