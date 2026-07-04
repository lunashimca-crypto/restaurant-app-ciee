export default function SignatureDishList({ dishes }) {
  if (!dishes?.length) return null;
  return (
    <ul className="dish-list">
      {dishes.map((dish) => (
        <li key={dish}>{dish}</li>
      ))}
    </ul>
  );
}
