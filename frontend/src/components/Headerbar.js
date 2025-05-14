/*
    Headerbar.js
    このコンポーネントは、アプリケーションの上部にヘッダーバーを配置するために使用されます。
*/

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // ← 追加

import logo from '../images/sainta_logo.png'; // ← ロゴ画像をインポート

export default function Headerbar() {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        // トークンを削除
        localStorage.removeItem('token');
        toast.success('ログアウトしました！'); // ← 追加
        navigate('/login'); // ログイン画面に遷移
    };

    const [currentPage, setCurrentPage] = useState('login');
    const handlePageChange = (page) => {
        setCurrentPage(page);
        navigate(`/${page}`);
    };

    // check is logged in
    const isLoggedIn = localStorage.getItem('token') !== null;

    return (
        <>
            <div className="headerbar">
                <img src={logo} alt="Logo" className="logo" /> {/* ロゴ画像を表示 */}
                {isLoggedIn && (
                <button className="logout-button" onClick={handleLogout}>ログアウト</button>
                )}
                {!isLoggedIn && currentPage == 'login' && (
                    <button className="logout-button" onClick={() => handlePageChange('register')}>ユーザー登録</button>
                )}
                {!isLoggedIn && currentPage == 'register' && (
                    <button className="logout-button" onClick={() => handlePageChange('login')}>ログイン</button>
                )}
            </div>
        </>
    );
}
