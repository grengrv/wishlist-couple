import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, limit, getDocs, documentId } from "firebase/firestore";

const DEBOUNCE_MS = 220;

/**
 * useMentionAutocomplete
 *
 * Detects when the user types "@keyword" in a text field, queries Firestore
 * for matching usernames, and returns a suggestion list + helpers to insert
 * a chosen mention into the current value.
 *
 * @param {string}   value          – current input value
 * @param {Function} setValue       – setter for the input value
 * @param {string}   currentUsername – logged-in user's username (excluded from results)
 */
export function useMentionAutocomplete(value, setValue, currentUsername, members = []) {
  const [suggestions, setSuggestions]   = useState([]);
  const [isOpen, setIsOpen]             = useState(false);
  const [keyword, setKeyword]           = useState("");
  const [atIndex, setAtIndex]           = useState(-1);  // position of the triggering "@"
  const debounceRef                     = useRef(null);

  // Parse the current word at cursor to detect "@keyword"
  const detectMention = useCallback((text) => {
    // Walk backward from end to find the last "@" that hasn't been closed by a space
    const lastAt = text.lastIndexOf("@");
    if (lastAt === -1) { closeSuggestions(); return; }

    const textAfterAt = text.substring(lastAt + 1);
    // If there's a space after the @, the user has finished typing the mention
    if (textAfterAt.includes(" ")) { closeSuggestions(); return; }

    const kw = textAfterAt.trim();
    setKeyword(kw);
    setAtIndex(lastAt);

    if (kw.length === 0) {
      // Just typed "@" — show all (limited)
      fetchSuggestions("");
      return;
    }
    fetchSuggestions(kw);
  }, []); // eslint-disable-line

  function closeSuggestions() {
    setSuggestions([]);
    setIsOpen(false);
    setKeyword("");
    setAtIndex(-1);
  }

  function fetchSuggestions(kw) {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        let results = [];
        
        // Extract userIds from members prop (can be array of strings or objects)
        const userIds = members.map(m => typeof m === 'string' ? m : m.uid).filter(Boolean);

        if (userIds.length > 0) {
          // Handle Firestore "in" query limit (10 max)
          const chunks = [];
          for (let i = 0; i < userIds.length; i += 10) {
            chunks.push(userIds.slice(i, i + 10));
          }

          const fetchPromises = chunks.map(chunk => {
             // We query by document ID. In Firestore, use documentId()
             // But wait, the users collection uses uid as document id.
             const q = query(collection(db, "users"), where(documentId(), "in", chunk));
             return getDocs(q);
          });
          
          const snaps = await Promise.all(fetchPromises);
          results = snaps.flatMap(snap => snap.docs.map(d => ({ uid: d.id, ...d.data() })));

          // Filter by username keyword locally since we fetched by ID
          if (kw) {
            const lowerKw = kw.toLowerCase();
            results = results.filter(u => u.username.toLowerCase().startsWith(lowerKw));
          }
          
          // Exclude self and limit
          results = results.filter(u => u.username !== currentUsername).slice(0, 6);
          
        } else {
          // Fallback to global search if no group members (e.g. personal wish)
          let q;
          if (kw) {
            q = query(
              collection(db, "users"),
              where("username", ">=", kw),
              where("username", "<=", kw + "\uf8ff"),
              orderBy("username"),
              limit(6)
            );
          } else {
            q = query(collection(db, "users"), orderBy("username"), limit(6));
          }
          const snap = await getDocs(q);
          results = snap.docs
            .map(d => ({ uid: d.id, ...d.data() }))
            .filter(u => u.username !== currentUsername);
        }

        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (e) {
        console.error("Error fetching suggestions:", e);
        setSuggestions([]);
        setIsOpen(false);
      }
    }, DEBOUNCE_MS);
  }

  // Call this when the textarea changes
  const onInputChange = useCallback((text) => {
    detectMention(text);
  }, [detectMention]);

  // Insert the selected user's @mention into the value
  const insertMention = useCallback((username) => {
    if (atIndex === -1) return;
    const before = value.substring(0, atIndex);
    const after  = value.substring(atIndex + 1 + keyword.length);
    setValue(`${before}@${username} ${after}`);
    closeSuggestions();
  }, [value, atIndex, keyword]); // eslint-disable-line

  // Close when pressing Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") closeSuggestions(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { suggestions, isOpen, keyword, insertMention, closeSuggestions, onInputChange };
}
