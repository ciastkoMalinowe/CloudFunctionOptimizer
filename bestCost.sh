grep -E 'Best cost so far:' output*.out | awk '{print $5}' | sort -n | head -1
