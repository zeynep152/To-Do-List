document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('new-todo');
    const input = document.getElementById('new-todo-input');
    const todoList = document.getElementById('todo-list');
    const editSection = document.getElementById('edit-section');
    const editInput = document.getElementById('edit-todo-input');
    let editId = null;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const todoText = input.value.trim();
        if (todoText) {
            await fetch('/todos', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: todoText, done: false}),
            });
            input.value = '';
            loadTodos();
        }
    });

    const loadTodos = async () => {
        const response = await fetch('/todos');
        const todos = await response.json();
        todoList.innerHTML = '';
        todos.forEach(todo => {
            const li = document.createElement('li');
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.done;
            checkbox.addEventListener('change', () => updateTodoStatus(todo.id, checkbox.checked));
            
            const text = document.createElement('span');
            text.textContent = todo.text;

            const actions = document.createElement('div');
            actions.className = 'actions';

            const editImg = document.createElement('img');
            editImg.src = 'png-clipart-computer-icons-pencil-symbol-pencil-pencil-black.png'; 
            editImg.alt = 'Edit';
            editImg.addEventListener('click', () => editTodo(todo.id, text));

            const deleteImg = document.createElement('img');
            deleteImg.src = 'png-transparent-rubbish-bins-waste-paper-baskets-computer-icons-recycling-wheelie-bin-packaging-icon-text-rectangle-recycling.png'; // Silme ikonu
            deleteImg.alt = 'Delete';
            deleteImg.addEventListener('click', () => deleteTodo(todo.id, li));

            actions.appendChild(editImg);
            actions.appendChild(deleteImg);

            li.appendChild(checkbox);
            li.appendChild(text);
            li.appendChild(actions);
            todoList.appendChild(li);
        });
    };

    const updateTodoStatus = async (id, done) => {
        await fetch(`/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ done }),
        });
    };

    const editTodo = (id, textElement) => {
        editInput.value = textElement.textContent;
    
        editSection.style.display = 'block';
    
        const saveButton = document.getElementById('save-edit');
        saveButton.onclick = async () => {
            const newText = editInput.value.trim();
            if (newText) {
                await fetch(`/todos/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: newText }),
                });
    
                editSection.style.display = 'none';
                loadTodos();
            }
        };
    };
    

    const deleteTodo = async (id, listItem) => {
        await fetch(`/todos/${id}`, {
            method: 'DELETE',
        });
        listItem.remove();
    };

    loadTodos();

});