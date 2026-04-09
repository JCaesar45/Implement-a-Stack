import java.util.ArrayList;

public class Stack {
    private ArrayList<Object> items;   // supports any type (like Object in JS)

    public Stack() {
        items = new ArrayList<>();
    }

    public void push(Object element) {
        items.add(element);
    }

    public Object pop() {
        if (items.isEmpty()) {
            return null;
        }
        return items.remove(items.size() - 1);
    }

    public Object peek() {
        if (items.isEmpty()) {
            return null;
        }
        return items.get(items.size() - 1);
    }

    public boolean isEmpty() {
        return items.isEmpty();
    }

    public void clear() {
        items.clear();
    }
}
