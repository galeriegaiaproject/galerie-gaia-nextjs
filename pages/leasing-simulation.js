import React from 'react'
import SEO from '@/components/SEO'

const LeasingSimulation = ({ tina, ...props }) => {
  return (
    <>
      <SEO
        title={`Simulation Leasing par Bail Art - Galerie Gaïa`}
        description={`Simulez le leasing d'une oeuvre de la Galerie Gaïa, galerie d'art en ligne et à Nantes à l'aide de Bail Art.`}
        url={'/leasing-simulation'}
        metadata={{}}
      />
      <div css={LeasingSimulation.styles.element}>
        <iframe src="https://app.bail-art.com/simulation?apiKey=skba_II752VT8W9NJ52UFRTSF35QREO9RV8" id="bail_art_iframe"></iframe>
      </div>
    </>
  )
}

LeasingSimulation.styles = {
  element: {
    width: '100vw',
    height: '100vh',
    '>iframe': {
      width: '100%',
      height: '100%',
      border: 'none',
    },
  },
}

export default LeasingSimulation
