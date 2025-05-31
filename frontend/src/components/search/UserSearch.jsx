import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import UserListItem from "./UserListItem";
import debounce from "lodash.debounce";
import SearchSkeleton from "../skeletons/SidebarSkeleton";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../../store/useChatStore";

const UserSearch = () => {
    const { t } = useTranslation();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const searchContainerRef = useRef(null);
    const navigate = useNavigate();
    const { setSelectedUser } = useChatStore();

    const performSearch = async (searchQuery) => {
        const trimmedQuery = searchQuery.trim();
        if (!trimmedQuery) {
            setResults([]);
            setIsLoading(false);
            setError(null);
            setShowResults(false);
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const res = await axiosInstance.get(
                `/users/search?q=${encodeURIComponent(trimmedQuery)}`
            );
            setResults(res.data);
            setShowResults(true);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || t("userSearch.error");
            setError(errorMessage);
            setResults([]);
            setShowResults(true);
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

    const handleUserSelectAndNavigate = (user) => {
        navigate(`/profile/${user._id}`);
        clearSearch();
        setSelectedUser(null);
    };

    const clearSearch = () => {
        setQuery("");
        setResults([]);
        setError(null);
        setIsLoading(false);
        setShowResults(false);
        debouncedSearchRef.current.cancel();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            debouncedSearchRef.current.cancel();
        };
    }, []);

    return (
        <div className="relative" ref={searchContainerRef}>
            <div className="form-control">
                <label className="input input-sm flex items-center gap-2 h-9 border border-base-300 rounded-lg bg-base-100 focus-within:outline-none transition-colors duration-200 w-full">
                    <Search className="w-4 h-4 opacity-70" />
                    <input
                        type="text"
                        placeholder={t("userSearch.placeholder")}
                        className="grow bg-transparent text-sm focus:outline-none"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => query.trim() && setShowResults(true)}
                    />
                    {isLoading ? (
                        <span className="loading loading-spinner loading-xs opacity-70"></span>
                    ) : query ? (
                        <button
                            type="button"
                            className="btn btn-ghost btn-circle btn-xs p-0 m-0 h-auto min-h-0"
                            onClick={clearSearch}
                            aria-label={t("userSearch.clearSearch")}
                        >
                            <X className="w-4 h-4 opacity-70 hover:text-error" />
                        </button>
                    ) : null}
                </label>
            </div>

            {showResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto p-2">
                    {isLoading && results.length === 0 ? (
                        <SearchSkeleton count={3} />
                    ) : error ? (
                        <p className="text-error text-xs text-center p-2">
                            {error}
                        </p>
                    ) : results.length > 0 ? (
                        <ul className="space-y-1">
                            {results.map((user) => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    onUserSelect={handleUserSelectAndNavigate}
                                />
                            ))}
                        </ul>
                    ) : query.trim() && !isLoading ? (
                        <p className="text-center text-xs text-base-content/50 p-2">
                            {t("userSearch.noUsersFound")}
                        </p>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default UserSearch;
