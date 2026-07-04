export default function NaverMapLink({ url }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="action-btn">
      📍 Open in Naver Map
    </a>
  );
}
