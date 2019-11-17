grep -E 'Best time so far: \(' output*.out | awk '{print $8}' | sort -n | head -1
