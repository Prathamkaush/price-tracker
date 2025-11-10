import { useState } from "react";
import axios from "axios";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.get(
        `https://price-tracker-402b.onrender.com/api/track?query=${query}`
      );
      setResults(data);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">💸 Price Tracker</h1>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search for a product..."
          className="border p-3 rounded-md w-80"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-500 text-white px-5 py-3 rounded-md hover:bg-blue-600"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 max-w-6xl">
          {Object.values(results).map((site, i) => (
            <div
              key={i}
              className="border p-4 rounded-lg bg-white shadow-md hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">{site.site}</h2>
              {site.error ? (
                <p className="text-red-500">{site.error}</p>
              ) : (
                <>
                  <img
                    src={site.image}
                    alt={site.title}
                    className="w-full h-48 object-contain mb-3"
                  />
                  <p className="font-medium mb-1">{site.title}</p>
                  <p className="text-green-600 font-bold text-lg mb-2">
                    {site.price ? `₹${site.price}` : "Price not available"}
                  </p>
                  {site.link && (
                    <a
                      href={site.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View on {site.site}
                    </a>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
