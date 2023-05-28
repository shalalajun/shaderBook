#include <common>
#include <packing>

#include <lights_pars_begin>

#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

uniform vec3 uColor;
uniform float uGlossiness;
uniform sampler2D uRamp;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {

  DirectionalLightShadow directionalShadow = directionalLightShadows[0];

  float shadow = getShadow(
    directionalShadowMap[0],
    directionalShadow.shadowMapSize,
    directionalShadow.shadowBias,
    directionalShadow.shadowRadius,
    vDirectionalShadowCoord[0]
  );


  float NdotL = dot(vNormal, directionalLights[0].direction);
  float NdotV = saturate(dot(vNormal, vViewDir));

  float lightIntensity =max((NdotL * shadow),0.0);
   //https://celestialbody.tistory.com/16 참고
  vec4 ramp = texture2D(uRamp,vec2(lightIntensity,0.5));
  //vec4 ramp = texture2D(uRamp,vec2(lightIntensity,NdotV));


   gl_FragColor = vec4(ramp);
}