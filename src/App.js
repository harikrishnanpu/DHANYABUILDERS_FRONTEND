import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { signout } from './actions/userActions';
import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRoute';
import CartScreen from './screens/CartScreen';
import HomeScreen from './screens/HomeScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import OrderScreen from './screens/OrderScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductScreen from './screens/ProductScreen';
import ProfileScreen from './screens/ProfileScreen';
import RegisterScreen from './screens/RegisterScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import SigninScreen from './screens/SigninScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import OrderListScreen from './screens/OrderListScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import SellerRoute from './components/SellerRoute';
import SellerScreen from './screens/SellerScreen';
import SearchBox from './components/SearchBox';
import SearchScreen from './screens/SearchScreen';
import { listProductCategories } from './actions/productActions';
import LoadingBox from './components/LoadingBox';
import MessageBox from './components/MessageBox';
import MapScreen from './screens/MapScreen';
import DashboardScreen from './screens/DashboardScreen';
import SupportScreen from './screens/SupportScreen';
import ChatBox from './components/ChatBox';
import axios from 'axios';
import AttendenceScreen from './screens/AttendenceScreen';

axios.defaults.baseURL = 'https://dhanyabuilders-backend.onrender.com/';

function App() {
  const cart = useSelector((state) => state.cart);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const { cartItems } = cart;
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const dispatch = useDispatch();
  const signoutHandler = () => {
    dispatch(signout(userInfo._id));
  };

  const productCategoryList = useSelector((state) => state.productCategoryList);
  const {
    loading: loadingCategories,
    error: errorCategories,
    categories,
  } = productCategoryList;
  useEffect(() => {
    dispatch(listProductCategories());
  }, [dispatch]);

  const navbarMenu = useRef(null);
  const burgerMenu = useRef(null);

const sidebarOpen = ()=>{
  if(navbarMenu.current.classList.contains('is-active')){
    sidebarClose()
  }else{
  navbarMenu.current.classList.add('is-active');
  burgerMenu.current.classList.add('is-active');
  }
}

const menuLink = useRef(null);

const sidebarClose = ()=>{
  navbarMenu.current.classList.remove('is-active');
  burgerMenu.current.classList.remove('is-active');
}

  return (
    <BrowserRouter>
      <div className="grid-container">

<header className="header" id="header">
   <nav className="navbar container">
      <a href="/" className="brand">Dhanya Builders</a>
      <div className="search">
         <form className="search-form">
            <SearchBox />
            <button type="submit" className="search-submit" disabled><i className="bx bx-search"></i></button>
         </form>
      </div>
      <div ref={navbarMenu} className="menu" id="menu">
        <ul className="menu-inner">
          {userInfo && 
            <li className="menu-item"><a href="/profile" onClick={sidebarClose} ref={menuLink} className="menu-link">Hi, {userInfo.name}</a></li>
          }
      {userInfo && userInfo.isAdmin && (
        <li className="menu-item"><a href="/dashboard" onClick={sidebarClose} ref={menuLink} className="menu-link">Admin</a></li>
       )}
      {userInfo && userInfo.isSeller && (

         <li className="menu-item"><a href="/productlist/seller" onClick={sidebarClose} ref={menuLink} className="menu-link">Member</a></li>

        ) }
         { userInfo ? (
<>           
           {/* <li className="menu-item"><a href="/orderhistory" onClick={sidebarClose}  ref={menuLink} className="menu-link">Order History</a></li> */}
            <li className="menu-item"><a href="/cart" onClick={sidebarClose}  ref={menuLink} className="menu-link">Cart               {cartItems.length > 0 && (
              <span className="badge">{cartItems.length}</span>
            )} </a></li>
            <li className="menu-item"><a onClick={signoutHandler}  ref={menuLink} className="menu-link">SignOut</a></li>
            </>
  ) : (
         <li className="menu-item"><a href="/signin" onClick={sidebarClose}  ref={menuLink} className="menu-link">SignIn</a></li>

         )
        }
        </ul>
      </div>
      <div ref={burgerMenu} onClick={sidebarOpen} className="burger" id="burger">
         <span className="burger-line"></span>
         <span className="burger-line"></span>
         <span className="burger-line"></span>
      </div>
   </nav>
</header>

        {/* <aside className={sidebarIsOpen ? 'open' : ''}>
          <ul className="categories">
            <li>
              <strong>Categories</strong>
              <button
                onClick={sidebarClose}
                className="close-sidebar"
                type="button"
              >
                <i onClick={sidebarClose} className="fa fa-close"></i>
              </button>
            </li>
            {loadingCategories ? (
              <LoadingBox></LoadingBox>
            ) : errorCategories ? (
              <MessageBox variant="danger">{errorCategories}</MessageBox>
            ) : (
              categories.map((c) => (
                <li key={c}>
                  <Link
                    to={`/search/category/${c}`}
                    onClick={() => setSidebarIsOpen(false)}
                  >
                    {c}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </aside> */}
        <main style={{overflow:'scroll'}}>
          <Routes>
            <Route path="/seller/:id" element={<SellerScreen />}></Route>
            <Route path="/cart" element={<CartScreen />}></Route>
            <Route path="/cart/:id" element={<CartScreen />}></Route>
            <Route
              path="/product/:id"
              element={<ProductScreen />}
              exact
            ></Route>
            <Route
              path="/product/:id/edit"
              element={<ProductEditScreen />}
              exact
            ></Route>
            <Route path="/signin" element={<SigninScreen />}></Route>
            <Route path="/register" element={<RegisterScreen />}></Route>
            <Route path="/shipping" element={<ShippingAddressScreen />}></Route>
            <Route path="/payment" element={<PaymentMethodScreen />}></Route>
            <Route path="/placeorder" element={<PlaceOrderScreen />}></Route>
            <Route path="/order/:id" element={<OrderScreen />}></Route>
            <Route
              path="/orderhistory"
              element={<OrderHistoryScreen />}
            ></Route>
            <Route path="/search/name" element={<SearchScreen />} exact></Route>
            <Route
              path="/search/name/:name"
              element={<SearchScreen />}
              exact
            ></Route>
            <Route
              path="/search/category/:category"
              element={<SearchScreen />}
              exact
            ></Route>
            <Route
              path="/search/category/:category/name/:name"
              element={<SearchScreen />}
              exact
            ></Route>
            <Route
              path="/search/category/:category/name/:name/min/:min/max/:max/rating/:rating/order/:order/pageNumber/:pageNumber"
              element={<SearchScreen />}
              exact
            ></Route>

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfileScreen />
                </PrivateRoute>
              }
            />
            <Route
              path="/map"
              element={
                <PrivateRoute>
                  <MapScreen />
                </PrivateRoute>
              }
            />

            <Route
              path="/productlist"
              element={
                <AdminRoute>
                  <ProductListScreen />
                </AdminRoute>
              }
            />

            <Route
              path="/productlist/pageNumber/:pageNumber"
              element={
                <AdminRoute>
                  <ProductListScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/orderlist"
              element={
                <AdminRoute>
                  <OrderListScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/userlist"
              element={
                <AdminRoute>
                  <UserListScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/user/:id/edit"
              element={
                <AdminRoute>
                  <UserEditScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <AdminRoute>
                  <DashboardScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/support"
              element={
                <AdminRoute>
                  <SupportScreen />
                </AdminRoute>
              }
            />
            <Route
              path="/productlist/seller"
              element={
                <SellerRoute>
                  <ProductListScreen />
                </SellerRoute>
              }
            />
            <Route
              path="/orderlist/seller"
              element={
                <SellerRoute>
                  <OrderListScreen />
                </SellerRoute>
              }
            />

            <Route
              path="/attendence"
              element={
                <SellerRoute>
                  <AttendenceScreen />
                </SellerRoute>
              }
            />

            <Route path="/" element={<HomeScreen />} exact></Route>
          </Routes>
        </main>
        <footer className="row center">
          {userInfo && !userInfo.isAdmin && <ChatBox userInfo={userInfo} />}
          <div>All right reserved</div>{' '}
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
