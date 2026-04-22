// src/App.js - Adicione a rota /vendedor no Routes:

<Routes>
  <Route path="/login" element={!usuario ? <Login /> : <Navigate to="/" />} />
  <Route path="/cadastro" element={!usuario ? <Cadastro /> : <Navigate to="/" />} />

  {/* Rota Raiz: Redireciona conforme a função assim que o app carrega */}
  <Route path="/" element={
    <ProtectedRoute>
      {usuario?.cargo === 'estoquista' || usuario?.funcao === 'estoquista' 
        ? <Navigate to="/estoque" replace /> 
        : <Navigate to="/vendedor" replace />}
    </ProtectedRoute>
  } />

  {/* Tela do Vendedor (Antiga TelaInicial ou Loja) */}
  <Route path="/vendedor" element={
    <ProtectedRoute>
      <TelaInicial />
    </ProtectedRoute>
  } />

  <Route path="/estoque" element={
    <ProtectedRoute funcoesPermitidas={['estoquista']}>
      <TelaEstoquista />
    </ProtectedRoute>
  } />

  {/* ... outras rotas como /loja-45 ... */}
</Routes>

export default App;