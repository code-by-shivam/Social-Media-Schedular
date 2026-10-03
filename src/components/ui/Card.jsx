function Card({ children, className = "" }) {
  return (
    <div className={`sp-fluid-section ${className}`}>
      {children}
    </div>
  );
}

export default Card;