class Stack:
    def __init__(self):
        self._items = []          # private list to store elements
    
    def push(self, element):
        """Adds an element to the top of the stack."""
        self._items.append(element)
    
    def pop(self):
        """Removes and returns the top element, or None if stack is empty."""
        if not self._items:
            return None
        return self._items.pop()
    
    def peek(self):
        """Returns the top element without removing it, or None if empty."""
        if not self._items:
            return None
        return self._items[-1]
    
    def isEmpty(self):
        """Returns True if the stack has no elements."""
        return len(self._items) == 0
    
    def clear(self):
        """Removes all elements from the stack."""
        self._items.clear()       # or self._items = []
