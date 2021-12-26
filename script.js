let cart = []; // Informações do carrinho
let modalQt = 1; // Qnt. selecionada de itens (pizzas)
let modalKey = 0; // Qual a pizza

//Simplificar a digitação do "querySelector"
const qs = (el) =>  document.querySelector(el)
const qsa = (el) =>  document.querySelectorAll(el)

pizzaJson.map((item, index)=>{
    //Clonando o item e tudo o que estiver dentro dele
    let pizzaItem = qs('.models .pizza-item').cloneNode(true);

    //Adiciona para cada pizza uma chave, para que possa ser identificado corretamente qual pizza o usuário clicou.
    pizzaItem.setAttribute('data-key', index);

    pizzaItem.querySelector('.pizza-item--img img').src = item.img;
    pizzaItem.querySelector('.pizza-item--name').innerHTML = item.name;
    pizzaItem.querySelector('.pizza-item--desc').innerHTML = item.description;
    pizzaItem.querySelector('.pizza-item--price').innerHTML = `R$ ${item.price.toFixed(2)}`;
    
    // Quando  clica em uma pizza específica
    pizzaItem.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault(); // Não atualizar a tela quando clicar no item

        //Pegar a chave ("data-key") do elemento ".pizza-item". Para ter acesso a qual pizza o usuário clicou.
        //Acha o elemento mais próximo que contenha a classe "pizza-item" dentro ou fora do elemento atual (que nesse caso é o "a")
        let key = e.target.closest('.pizza-item').getAttribute('data-key');
        modalQt = 1; //Reset na qnt de Pizza selecionadas toda vez que abre a janela
        modalKey = key;

        // console.log(pizzaJson[key]);

        //Preenchendo o conteúdo da janela do item
        qs('.pizzaBig img').src = pizzaJson[key].img;
        qs('.pizzaInfo h1').innerHTML = pizzaJson[key].name;
        qs('.pizzaInfo--desc').innerHTML = pizzaJson[key].description;
        qs('.pizzaInfo--actualPrice').innerHTML = `R$ ${pizzaJson[key].price.toFixed(2)}`;
        qs('.pizzaInfo--size.selected').classList.remove('selected') //remover marcação de "selecionado"
        qsa('.pizzaInfo--size').forEach((size, sizeIndex)=>{
            if(sizeIndex == 2){
                size.classList.add('selected');
            }
            size.querySelector('span').innerHTML = pizzaJson[key].sizes[sizeIndex];
        });

       qs('.pizzaInfo--qt').innerHTML = modalQt; 

        //Efeito visual ao abrir a janela
        //OBS: O efeito acontece por conta da propriedade "transition" inserida no css
        qs('.pizzaWindowArea').style.opacity = 0;
        qs('.pizzaWindowArea').style.display = 'flex';
        setTimeout(() => {
            qs('.pizzaWindowArea').style.opacity = 1
        }, 200); 
    })

    //Preenchendo as informações em pizzaitem
    qs('.pizza-area').append(pizzaItem);
});

// ***************** Eventos de click do MODAL ***************** 

// Botão cancelar/voltar
function closeModal(){
    qs('.pizzaWindowArea').style.opacity = 0;
    setTimeout(() => {
        qs('.pizzaWindowArea').style.display = 'none';
    }, 500);
}

qsa('.pizzaInfo--cancelButton, .pizzaInfo--cancelMobileButton').forEach((item)=>{
    item.addEventListener('click', closeModal);
});

// Botão quantidade "+" e "-"
qs('.pizzaInfo--qtmenos').addEventListener('click', ()=>{
    if(modalQt > 1){
        modalQt--;
        qs('.pizzaInfo--qt').innerHTML = modalQt;
    }
})

qs('.pizzaInfo--qtmais').addEventListener('click', ()=>{
    modalQt++;
    qs('.pizzaInfo--qt').innerHTML = modalQt; 
})

//Botão tamanho da pizza "grande", "média", "pequena"
qsa('.pizzaInfo--size').forEach((size, sizeIndex)=>{
    size.addEventListener('click', (e)=>{
        qs('.pizzaInfo--size.selected').classList.remove('selected'); //remover marcação de "selecionado"
        size.classList.add('selected');
    })
});


//Botão do Carrinho
qs('.pizzaInfo--addButton').addEventListener('click', ()=>{
    //Qual pizza? = modalKey
    //Quantas pizzas = modalQt
    //Qual tamanho da pizza?
    let size =  parseInt(qs('.pizzaInfo--size.selected').getAttribute('data-key'));

    //Criar um identificador para caso o usuário queira colocar mais quantidade da mesma pizza
    let identifier = pizzaJson[modalKey].id+'@'+size;
    let key = cart.findIndex((item)=>{
        return item.identifier == identifier; //Se achar um item no carrinho com o mesmo identificador ele retorna o índice da posição do elemento no carrinho, se não achar ele retorna o "-1"
    })
    if(key > -1 ){ // Encontrou o item
        cart[key].qt += modalQt;
    } else { // Não encontrou o item
        cart.push({
            identifier,
            id: pizzaJson[modalKey].id,
            size, //size: size
            qt: modalQt,
        });
    }
    updateCart();
    closeModal();
});

//Eventos de click carrinho Mobile
qs('.menu-openner').addEventListener('click', ()=>{
    if(cart.length > 0){
        qs('aside').style.left = '0'; // Mostrar barra lateral
    }
})
qs('.menu-closer').addEventListener('click', ()=>{
    qs('aside').style.left = '100vw'; // Ocultar barra lateral
})

//Mostrar/Esconder carrinho. Função chamada ao adicionar item no carrinho.
function updateCart(){
    // Carrinho Mobile
    qs('.menu-openner span').innerHTML = cart.length;

    //Tem item no carrinho?
    if(cart.length > 0){ //Mostrar o Carrinho
        qs('aside').classList.add('show')
        qs('.cart').innerHTML = '';

        let subtotal = 0;
        let desconto = 0;
        let total = 0;

        for(let i in cart){
            //Pegar as informações do item no carrinho
            let pizzaItem = pizzaJson.find((item)=>{
                return item.id == cart[i].id
            })

            subtotal += pizzaItem.price * cart[i].qt;

            //Preenchendo as informações do carrinho...
            let cartItem = qs('.models .cart--item').cloneNode(true) //clone do modelo
            let pizzaSizeName;

            switch(cart[i].size){
                case 0:
                    pizzaSizeName = 'P';
                    break;
                case 1:
                    pizzaSizeName = 'M';
                    break;
                case 2:
                    pizzaSizeName = 'G';
                    break;
            }

            let pizzaName = `${pizzaItem.name} (${pizzaSizeName})`

            cartItem.querySelector('img').src = pizzaItem.img;
            cartItem.querySelector('.cart--item-nome').innerHTML = pizzaName;
            cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt;
            cartItem.querySelector('.cart--item-qtmenos').addEventListener('click', () =>{
                if(cart[i].qt > 1 ){
                    cart[i].qt--;
                } else{ // remover item do carrinho
                    cart.splice(i, 1)
                }
                updateCart();
            })
            cartItem.querySelector('.cart--item-qtmais').addEventListener('click', () =>{
                cart[i].qt++;
                updateCart();
            })


            qs('.cart').append(cartItem);
        }

        desconto = subtotal * 0.1;
        total = subtotal - desconto;

        qs('.subtotal span:last-child').innerHTML = `R$ ${subtotal.toFixed(2)}`
        qs('.desconto span:last-child').innerHTML = `R$ ${desconto.toFixed(2)}`
        qs('.total span:last-child').innerHTML = `R$ ${total.toFixed(2)}`

    } else { //Esconder Carrinho
        qs('aside').classList.remove('show')
        qs('aside').style.left = "0";
    }
}