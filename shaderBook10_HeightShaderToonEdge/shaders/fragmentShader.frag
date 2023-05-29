#include <common>
#include <packing>

#include <lights_pars_begin>

#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

uniform vec3 uColor;
uniform float uGlossiness;

uniform vec3 bottomColor;
uniform vec3 topColor;
uniform float minHeight;
uniform float maxHeight;
varying vec3 vPosition;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {

  float yNormalized = (vPosition.y - minHeight) / (maxHeight - minHeight);
  vec3 color = mix(bottomColor, topColor, yNormalized);

  DirectionalLightShadow directionalShadow = directionalLightShadows[0];

  float shadow = getShadow(
    directionalShadowMap[0],
    directionalShadow.shadowMapSize,
    directionalShadow.shadowBias,
    directionalShadow.shadowRadius,
    vDirectionalShadowCoord[0]
  );


  float NdotL = dot(vNormal, directionalLights[0].direction);

  float lightIntensity =max((NdotL * shadow),0.0)*.5 + 0.5;
  float toon = ceil(lightIntensity * 1.5) / 1.5;

  vec3 toonGradation = mix(bottomColor, vec3(toon), vec3(yNormalized));//툰의 명암을 높이에 따라 점점 아래로 연하게 만드는 부분

  vec3 directionalLight = color * toonGradation;

  //스페큘러
  vec3 halfVector = normalize(directionalLights[0].direction + vViewDir);
  float NdotH = clamp(dot(vNormal, halfVector),0.0,1.0);

  float specularIntensity = pow(NdotH * lightIntensity, 50.0 / uGlossiness);
  float specularIntensitySmooth = smoothstep(0.05, 0.1, specularIntensity);

  vec3 specular = specularIntensitySmooth * vec3(1.0,1.0,1.0);
  
   gl_FragColor = vec4((directionalLight + ambientLightColor + specular), 1.0);
}