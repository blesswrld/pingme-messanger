import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import UserListItem from "./UserListItem";
import debounce from "lodash.debounce";

const UserSearch = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const performSearch = async (searchQuery) => {
        const trimmedQuery = searchQuery.trim();
        if (!trimmedQuery) {
            setResults([]);
            setIsLoading(false);
            setError(null);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const res = await axiosInstance.get(
                `/users/search?q=${encodeURIComponent(trimmedQuery)}`
            );
            setResults(res.data);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "Failed to search users";
            setError(errorMessage);
            toast.error(errorMessage);

            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const debouncedSearchRef = useRef(debounce(performSearch, 400));

    const handleInputChange = (e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        debouncedSearchRef.current(newQuery);
    };

    const clearSearch = () => {
        setQuery("");
        setResults([]);
        setError(null);
        setIsLoading(false);
        debouncedSearchRef.current.cancel();
    };

    useEffect(() => {
        const debouncedFunc = debouncedSearchRef.current;
        return () => {
            debouncedFunc.cancel();
        };
    }, []);

    return (
        <div className="p-1 space-y-2">
            <div className="form-control">
                <div className="input-group flex justify-center marker:">
                    <input
                        type="text"
                        placeholder="Search…"
                        className="input input-bordered w-full input-sm"
                        value={query}
                        onChange={handleInputChange}
                    />
                    <button type="button" className="btn btn-square btn-sm">
                        {/* Кнопка справа */}
                        {isLoading ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                        ) : query ? (
                            <X
                                className="h-4 w-4 cursor-pointer hover:text-error"
                                onClick={clearSearch}
                            />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>
            {error && <p className="text-error text-sm px-1">{error}</p>}
            {/* Результаты поиска */}
            {results.length > 0 && !isLoading && (
                <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                    {results.map((user) => (
                        <UserListItem
                            key={user._id}
                            user={user}
                            onUserSelect={clearSearch}
                        />
                    ))}
                </ul>
            )}
            {!isLoading && !error && query.trim() && results.length === 0 && (
                <p className="text-center text-xs text-gray-500 pt-2">
                    No users found
                </p>
            )}
        </div>
    );
};

export default UserSearch;
